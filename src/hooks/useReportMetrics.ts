import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { differenceInDays, subDays } from 'date-fns';
import { FinancialMetrics } from './useFinancialCalculations';
import { isFinancialDateWithinRange } from '@/utils/financialDate';

interface ComparativeMetrics {
  current: FinancialMetrics;
  previous: FinancialMetrics;
  variation: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
}

const calculateMetrics = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date
): FinancialMetrics => {
  let filteredTransactions = transactions.filter(t => 
    t.origem === workspace && 
    !t.deletado &&
    t.recorrencia_ativa !== false
  );

  if (startDate && endDate) {
    filteredTransactions = filteredTransactions.filter(t =>
      isFinancialDateWithinRange(t.data, startDate, endDate)
    );
  }

  const entradas = filteredTransactions.filter(t => t.tipo === 'entrada');
  const saidas = filteredTransactions.filter(t => t.tipo === 'saida');

  const entradasRealizadas = entradas
    .filter(t => t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);

  const entradasPrevistas = entradas
    .filter(t => t.status === 'prevista' || t.status === 'vencida')
    .reduce((sum, t) => sum + t.valor, 0);

  const saidasRealizadas = saidas
    .filter(t => t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);

  const saidasPrevistas = saidas
    .filter(t => t.status === 'prevista' || t.status === 'vencida')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalEntradas = entradasRealizadas + entradasPrevistas;
  const totalSaidas = saidasRealizadas + saidasPrevistas;
  const saldoReal = entradasRealizadas - saidasRealizadas;
  const saldoProjetado = totalEntradas - totalSaidas;

  return {
    entradasRealizadas,
    entradasPrevistas,
    saidasRealizadas,
    saidasPrevistas,
    saldoReal,
    saldoProjetado,
    totalEntradas,
    totalSaidas
  };
};

const getPreviousPeriod = (startDate: Date, endDate: Date) => {
  const duration = differenceInDays(endDate, startDate) + 1;
  const previousEndDate = subDays(startDate, 1);
  const previousStartDate = subDays(previousEndDate, duration - 1);
  return { previousStartDate, previousEndDate };
};

export const useReportMetrics = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date
): { metrics: ComparativeMetrics; loading: boolean } => {
  const metrics = useMemo(() => {
    const currentMetrics = calculateMetrics(transactions, workspace, startDate, endDate);

    let previousMetrics = currentMetrics;
    let variation: ComparativeMetrics['variation'] = {
      entradas: 0,
      saidas: 0,
      saldo: 0,
    };

    if (startDate && endDate) {
      const { previousStartDate, previousEndDate } = getPreviousPeriod(startDate, endDate);
      previousMetrics = calculateMetrics(transactions, workspace, previousStartDate, previousEndDate);

      const calculateVariation = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      variation = {
        entradas: calculateVariation(currentMetrics.totalEntradas, previousMetrics.totalEntradas),
        saidas: calculateVariation(currentMetrics.totalSaidas, previousMetrics.totalSaidas),
        saldo: calculateVariation(currentMetrics.saldoProjetado, previousMetrics.saldoProjetado),
      };
    }

    return {
      current: currentMetrics,
      previous: previousMetrics,
      variation,
    };
  }, [transactions, workspace, startDate, endDate]);

  return { metrics, loading: false };
};
