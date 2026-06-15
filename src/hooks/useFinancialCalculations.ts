
import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { calculateFinancialMetrics } from './useFinancialMetricsCore';

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
    const metrics = calculateFinancialMetrics({
      transactions,
      workspace,
      startDate,
      endDate,
      includeVencidas: true,
    });

    return {
      entradasRealizadas: metrics.entradasRealizadas,
      entradasPrevistas: metrics.entradasPrevistas,
      saidasRealizadas: metrics.saidasRealizadas,
      saidasPrevistas: metrics.saidasPrevistas,
      saldoReal: metrics.saldoReal,
      saldoProjetado: metrics.saldoProjetado,
      totalEntradas: metrics.totalEntradas,
      totalSaidas: metrics.totalSaidas
    };
  }, [transactions, workspace, startDate, endDate]);
};
