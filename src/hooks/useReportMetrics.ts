import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { FinancialMetrics } from './useFinancialCalculations';
import { calculateFinancialMetrics, getPreviousPeriodDates } from './useFinancialMetricsCore';

interface ComparativeMetrics {
  current: FinancialMetrics;
  previous: FinancialMetrics;
  variation: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
}

export const useReportMetrics = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date
): { metrics: ComparativeMetrics; loading: boolean } => {
  const metrics = useMemo(() => {
    const currentMetrics = calculateFinancialMetrics({
      transactions,
      workspace,
      startDate,
      endDate,
      includeVencidas: true,
    });

    let previousMetrics = currentMetrics;
    let variation: ComparativeMetrics['variation'] = {
      entradas: 0,
      saidas: 0,
      saldo: 0,
    };

    if (startDate && endDate) {
      const { previousStartDate, previousEndDate } = getPreviousPeriodDates(startDate, endDate);
      previousMetrics = calculateFinancialMetrics({
        transactions,
        workspace,
        startDate: previousStartDate,
        endDate: previousEndDate,
        includeVencidas: true,
      });
      variation = currentMetrics.variation;
    }

    return {
      current: currentMetrics,
      previous: previousMetrics,
      variation,
    };
  }, [transactions, workspace, startDate, endDate]);

  return { metrics, loading: false };
};
