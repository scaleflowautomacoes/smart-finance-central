import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { calculateFinancialMetrics, FinancialMetricsCore } from './useFinancialMetricsCore';

interface UseCentralMetricsOptions {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
  includeVencidas?: boolean; // Padrão: true (trata vencida como prevista)
}

export const useCentralMetrics = ({
  transactions,
  workspace,
  startDate,
  endDate,
  includeVencidas = true,
}: UseCentralMetricsOptions): { metrics: CentralMetrics; loading: boolean } => {
  return useMemo(() => {
    const metrics = calculateFinancialMetrics({
      transactions,
      workspace,
      startDate,
      endDate,
      includeVencidas,
    });
    return {
      metrics,
      loading: false,
    };
  }, [transactions, workspace, startDate, endDate, includeVencidas]);
};

export type CentralMetrics = FinancialMetricsCore;

export const calculateMetricsDirect = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date,
  includeVencidas: boolean = true
) => {
  return calculateFinancialMetrics({
    transactions,
    workspace,
    startDate,
    endDate,
    includeVencidas,
  });
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};
