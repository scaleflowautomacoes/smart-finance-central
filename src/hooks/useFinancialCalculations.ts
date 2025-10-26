
import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { isWithinInterval } from 'date-fns';

export interface FinancialMetrics {
  entradasRealizadas: number;
  entradasPrevistas: number;
  saidasRealizadas: number;
  saidasPrevistas: number;
  saldoReal: number;
  saldoProjetado: number;
  totalEntradas: number;
  totalSaidas: number;
}

export const useFinancialCalculations = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date
): FinancialMetrics => {
  return useMemo(() => {
    // Filtrar transações do workspace e período
    let filteredTransactions = transactions.filter(t => 
      t.origem === workspace && 
      !t.deletado &&
      t.recorrencia_ativa !== false
    );

    if (startDate && endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.data);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });
    }

    // Separar por tipo e status
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
  }, [transactions, workspace, startDate, endDate]);
};
