import { Transaction } from '@/types/financial';
import { differenceInDays, subDays } from 'date-fns';
import {
  buildDerivedCategoryMap,
  dedupeGeneratedRecurrences,
  filterTransactionsForPeriod,
} from '@/lib/financialAnalytics';

export interface FinancialMetricBreakdown {
  entradasRealizadas: number;
  entradasPrevistas: number;
  entradasVencidas: number;
  saidasRealizadas: number;
  saidasPrevistas: number;
  saidasVencidas: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoReal: number;
  saldoProjetado: number;
  entradasPorCategoria: { categoria: string; valor: number }[];
  saidasPorCategoria: { categoria: string; valor: number }[];
}

export interface FinancialMetricsCore extends FinancialMetricBreakdown {
  despesasReceitasRatio: number;
  healthScore: 'Excelente' | 'Bom' | 'Regular' | 'Ruim';
  variation: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
}

export interface CalculateFinancialMetricsOptions {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
  includeVencidas?: boolean;
}

export const getPreviousPeriodDates = (startDate: Date, endDate: Date) => {
  const duration = differenceInDays(endDate, startDate) + 1;
  const previousEndDate = subDays(startDate, 1);
  const previousStartDate = subDays(previousEndDate, duration - 1);
  return { previousStartDate, previousEndDate };
};

const calculateVariation = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getHealthScore = (ratio: number): FinancialMetricsCore['healthScore'] => {
  if (ratio <= 50) return 'Excelente';
  if (ratio <= 75) return 'Bom';
  if (ratio <= 90) return 'Regular';
  return 'Ruim';
};

const collectByCategory = (
  transactions: Transaction[],
  tipo: 'entrada' | 'saida',
  effectiveCategoryIdByTransactionId?: Map<string, string>,
) => {
  return transactions
    .filter((transaction) => transaction.tipo === tipo)
    .reduce((acc, transaction) => {
      const categoria = effectiveCategoryIdByTransactionId?.get(transaction.id) || transaction.categoria_id || 'Sem categoria';
      const existing = acc.find((item) => item.categoria === categoria);

      if (existing) {
        existing.valor += transaction.valor;
      } else {
        acc.push({ categoria, valor: transaction.valor });
      }

      return acc;
    }, [] as { categoria: string; valor: number }[])
    .sort((a, b) => b.valor - a.valor);
};

const filterFinancialTransactions = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date
) => {
  const filtered = filterTransactionsForPeriod(transactions, workspace, startDate, endDate);
  return dedupeGeneratedRecurrences(filtered);
};

const buildMetrics = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date,
  includeVencidas = true
): FinancialMetricBreakdown => {
  const filtered = filterFinancialTransactions(transactions, workspace, startDate, endDate);
  const derivedCategories = buildDerivedCategoryMap(filtered);
  const entradas = filtered.filter((transaction) => transaction.tipo === 'entrada');
  const saidas = filtered.filter((transaction) => transaction.tipo === 'saida');

  const entradasRealizadas = entradas
    .filter((transaction) => transaction.status === 'realizada')
    .reduce((sum, transaction) => sum + transaction.valor, 0);

  const entradasPrevistas = entradas
    .filter((transaction) =>
      includeVencidas
        ? transaction.status === 'prevista' || transaction.status === 'vencida'
        : transaction.status === 'prevista'
    )
    .reduce((sum, transaction) => sum + transaction.valor, 0);

  const entradasVencidas = entradas
    .filter((transaction) => transaction.status === 'vencida')
    .reduce((sum, transaction) => sum + transaction.valor, 0);

  const saidasRealizadas = saidas
    .filter((transaction) => transaction.status === 'realizada')
    .reduce((sum, transaction) => sum + transaction.valor, 0);

  const saidasPrevistas = saidas
    .filter((transaction) =>
      includeVencidas
        ? transaction.status === 'prevista' || transaction.status === 'vencida'
        : transaction.status === 'prevista'
    )
    .reduce((sum, transaction) => sum + transaction.valor, 0);

  const saidasVencidas = saidas
    .filter((transaction) => transaction.status === 'vencida')
    .reduce((sum, transaction) => sum + transaction.valor, 0);

  const totalEntradas = entradasRealizadas + entradasPrevistas;
  const totalSaidas = saidasRealizadas + saidasPrevistas;
  const saldoReal = entradasRealizadas - saidasRealizadas;
  const saldoProjetado = totalEntradas - totalSaidas;

  return {
    entradasRealizadas,
    entradasPrevistas,
    entradasVencidas,
    saidasRealizadas,
    saidasPrevistas,
    saidasVencidas,
    totalEntradas,
    totalSaidas,
    saldoReal,
    saldoProjetado,
    entradasPorCategoria: collectByCategory(entradas, 'entrada', derivedCategories.effectiveCategoryIdByTransactionId),
    saidasPorCategoria: collectByCategory(saidas, 'saida', derivedCategories.effectiveCategoryIdByTransactionId),
  };
};

export const calculateFinancialMetrics = ({
  transactions,
  workspace,
  startDate,
  endDate,
  includeVencidas = true,
}: CalculateFinancialMetricsOptions): FinancialMetricsCore => {
  const current = buildMetrics(transactions, workspace, startDate, endDate, includeVencidas);

  let variation: FinancialMetricsCore['variation'] = {
    entradas: 0,
    saidas: 0,
    saldo: 0,
  };

  if (startDate && endDate) {
    const { previousStartDate, previousEndDate } = getPreviousPeriodDates(startDate, endDate);
    const previous = buildMetrics(transactions, workspace, previousStartDate, previousEndDate, includeVencidas);

    variation = {
      entradas: calculateVariation(current.totalEntradas, previous.totalEntradas),
      saidas: calculateVariation(current.totalSaidas, previous.totalSaidas),
      saldo: calculateVariation(current.saldoProjetado, previous.saldoProjetado),
    };
  }

  const despesasReceitasRatio = current.totalEntradas > 0
    ? (current.totalSaidas / current.totalEntradas) * 100
    : 0;

  return {
    ...current,
    despesasReceitasRatio,
    healthScore: getHealthScore(despesasReceitasRatio),
    variation,
  };
};
