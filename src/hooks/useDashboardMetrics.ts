import { useMemo } from 'react';
import { Transaction, DashboardMetrics } from '@/types/financial';
import { isWithinInterval, differenceInDays, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { FinancialMetrics } from './useFinancialCalculations';

interface DashboardSummaryMetrics {
  receitasPeriodo: number;
  despesasPeriodo: number;
  saldoPeriodo: number;
  despesasPendentes: number;
  
  receitasVariation: number;
  despesasVariation: number;
  saldoVariation: number;
  
  healthScore: 'Excelente' | 'Bom' | 'Regular' | 'Ruim';
  despesasReceitasRatio: number;
}

const calculateMetrics = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate: Date,
  endDate: Date
): { totalEntradas: number; totalSaidas: number; saldo: number; pendente: number } => {
  const filteredTransactions = transactions.filter(t => 
    t.origem === workspace && 
    !t.deletado &&
    t.recorrencia_ativa !== false &&
    isWithinInterval(new Date(t.data), { start: startDate, end: endDate })
  );

  const entradasRealizadas = filteredTransactions
    .filter(t => t.tipo === 'entrada' && t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);
    
  const entradasPrevistas = filteredTransactions
    .filter(t => t.tipo === 'entrada' && t.status === 'prevista')
    .reduce((sum, t) => sum + t.valor, 0);

  const saidasRealizadas = filteredTransactions
    .filter(t => t.tipo === 'saida' && t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);

  const saidasPrevistas = filteredTransactions
    .filter(t => t.tipo === 'saida' && t.status === 'prevista')
    .reduce((sum, t) => sum + t.valor, 0);
    
  const saidasVencidas = filteredTransactions
    .filter(t => t.tipo === 'saida' && t.status === 'vencida')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalEntradas = entradasRealizadas + entradasPrevistas;
  const totalSaidas = saidasRealizadas + saidasPrevistas;
  const saldo = totalEntradas - totalSaidas;

  return {
    totalEntradas,
    totalSaidas,
    saldo,
    pendente: saidasPrevistas + saidasVencidas,
  };
};

const getPreviousPeriodDates = (startDate: Date, endDate: Date) => {
  const duration = differenceInDays(endDate, startDate) + 1;
  const previousEndDate = subDays(startDate, 1);
  const previousStartDate = subDays(previousEndDate, duration - 1);
  return { previousStartDate, previousEndDate };
};

const calculateVariation = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getHealthScore = (ratio: number): DashboardSummaryMetrics['healthScore'] => {
  if (ratio <= 50) return 'Excelente';
  if (ratio <= 75) return 'Bom';
  if (ratio <= 90) return 'Regular';
  return 'Ruim';
};

export const useDashboardMetrics = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate: Date,
  endDate: Date
): { metrics: DashboardSummaryMetrics; loading: boolean } => {
  return useMemo(() => {
    const current = calculateMetrics(transactions, workspace, startDate, endDate);
    const { previousStartDate, previousEndDate } = getPreviousPeriodDates(startDate, endDate);
    const previous = calculateMetrics(transactions, workspace, previousStartDate, previousEndDate);

    const receitasVariation = calculateVariation(current.totalEntradas, previous.totalEntradas);
    const despesasVariation = calculateVariation(current.totalSaidas, previous.totalSaidas);
    const saldoVariation = calculateVariation(current.saldo, previous.saldo);
    
    const despesasReceitasRatio = current.totalEntradas > 0 ? (current.totalSaidas / current.totalEntradas) * 100 : 0;

    return {
      metrics: {
        receitasPeriodo: current.totalEntradas,
        despesasPeriodo: current.totalSaidas,
        saldoPeriodo: current.saldo,
        despesasPendentes: current.pendente,
        
        receitasVariation,
        despesasVariation,
        saldoVariation,
        
        despesasReceitasRatio: despesasReceitasRatio,
        healthScore: getHealthScore(despesasReceitasRatio),
      },
      loading: false,
    };
  }, [transactions, workspace, startDate, endDate]);
};