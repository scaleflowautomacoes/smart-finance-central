import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { calculateFinancialMetrics, getPreviousPeriodDates, FinancialMetricsCore } from './useFinancialMetricsCore';

interface ComparativeMetrics {
  current: FinancialMetricsCore;
  previous: FinancialMetricsCore;
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
