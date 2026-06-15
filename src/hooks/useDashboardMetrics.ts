import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { calculateFinancialMetrics } from './useFinancialMetricsCore';

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

export const useDashboardMetrics = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date
): { metrics: DashboardSummaryMetrics; loading: boolean } => {
  return useMemo(() => {
    const metrics = calculateFinancialMetrics({
      transactions,
      workspace,
      startDate,
      endDate,
      includeVencidas: true,
    });

    return {
      metrics: {
        receitasPeriodo: metrics.totalEntradas,
        despesasPeriodo: metrics.totalSaidas,
        saldoPeriodo: metrics.saldoProjetado,
        despesasPendentes: metrics.saidasPrevistas,
        receitasVariation: metrics.variation.entradas,
        despesasVariation: metrics.variation.saidas,
        saldoVariation: metrics.variation.saldo,
        despesasReceitasRatio: metrics.despesasReceitasRatio,
        healthScore: metrics.healthScore,
      },
      loading: false,
    };
  }, [transactions, workspace, startDate, endDate]);
};
