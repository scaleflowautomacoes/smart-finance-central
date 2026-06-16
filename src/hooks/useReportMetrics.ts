import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { calculateFinancialMetrics, getPreviousPeriodDates, FinancialMetricsCore } from './useFinancialMetricsCore';
import { getPreviousYearRange } from '@/lib/financialPeriods';
import { isFinancialDateWithinRange } from '@/utils/financialDate';

interface ComparativeMetrics {
  current: FinancialMetricsCore;
  previousWindow: FinancialMetricsCore;
  previousYear: FinancialMetricsCore | null;
  variationWindow: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
  variationYear: {
    entradas: number;
    saidas: number;
    saldo: number;
  } | null;
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

    let previousWindowMetrics = currentMetrics;
    let previousYearMetrics: FinancialMetricsCore | null = null;
    let variationWindow: ComparativeMetrics['variationWindow'] = {
      entradas: 0,
      saidas: 0,
      saldo: 0,
    };
    let variationYear: ComparativeMetrics['variationYear'] = null;

    if (startDate && endDate) {
      const { previousStartDate, previousEndDate } = getPreviousPeriodDates(startDate, endDate);
      previousWindowMetrics = calculateFinancialMetrics({
        transactions,
        workspace,
        startDate: previousStartDate,
        endDate: previousEndDate,
        includeVencidas: true,
      });

      const previousYearRange = getPreviousYearRange(startDate, endDate);
      if (previousYearRange?.startDate && previousYearRange.endDate) {
        const hasHistoricalData = transactions.some((transaction) =>
          transaction.origem === workspace &&
          !transaction.deletado &&
          transaction.status !== 'cancelada' &&
          isFinancialDateWithinRange(transaction.data, previousYearRange.startDate, previousYearRange.endDate),
        );

        if (hasHistoricalData) {
          previousYearMetrics = calculateFinancialMetrics({
            transactions,
            workspace,
            startDate: previousYearRange.startDate,
            endDate: previousYearRange.endDate,
            includeVencidas: true,
          });
        }
      }

      const calculateVariation = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      variationWindow = {
        entradas: calculateVariation(currentMetrics.totalEntradas, previousWindowMetrics.totalEntradas),
        saidas: calculateVariation(currentMetrics.totalSaidas, previousWindowMetrics.totalSaidas),
        saldo: calculateVariation(currentMetrics.saldoProjetado, previousWindowMetrics.saldoProjetado),
      };

      if (previousYearMetrics) {
        variationYear = {
          entradas: calculateVariation(currentMetrics.totalEntradas, previousYearMetrics.totalEntradas),
          saidas: calculateVariation(currentMetrics.totalSaidas, previousYearMetrics.totalSaidas),
          saldo: calculateVariation(currentMetrics.saldoProjetado, previousYearMetrics.saldoProjetado),
        };
      }
    }

    return {
      current: currentMetrics,
      previousWindow: previousWindowMetrics,
      previousYear: previousYearMetrics,
      variationWindow,
      variationYear,
    };
  }, [transactions, workspace, startDate, endDate]);

  return { metrics, loading: false };
};
