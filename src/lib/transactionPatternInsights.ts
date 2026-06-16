import { differenceInCalendarDays } from 'date-fns';
import { Transaction } from '@/types/financial';
import { parseFinancialDate } from '@/utils/financialDate';

export type TransactionDirection = 'entrada' | 'saida';
export type TransactionCadence = 'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'trimestral' | 'irregular';

export interface TransactionPatternInsight {
  key: string;
  label: string;
  normalizedLabel: string;
  direction: TransactionDirection;
  amount: number;
  rowCount: number;
  uniqueDateCount: number;
  firstDate: string;
  lastDate: string;
  averageGapDays: number | null;
  medianGapDays: number | null;
  cadence: TransactionCadence;
  recurrenceScore: number;
  inflationRows: number;
  inflationRisk: boolean;
  sampleNames: string[];
  sampleDates: string[];
}

export interface TransactionPatternSummary {
  totalPatterns: number;
  recurringIncomePatterns: number;
  recurringExpensePatterns: number;
  inflatedSeriesCount: number;
  topPatterns: TransactionPatternInsight[];
  recurringIncome: TransactionPatternInsight[];
  recurringExpenses: TransactionPatternInsight[];
  inflatedSeries: TransactionPatternInsight[];
}

const hasRecurrenceLineage = (transaction: Transaction) =>
  Boolean(transaction.is_recorrente) ||
  Boolean(transaction.recorrencia_transacao_pai_id) ||
  Boolean(transaction.recorrencia_tipo) ||
  Boolean(transaction.recorrencia_total_ocorrencias);

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const stripRecurrenceSuffix = (value: string) =>
  value.replace(/(\s*\(\d+\/\d+\))+$/g, '').trim();

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const getRootId = (transaction: Transaction, byId: Map<string, Transaction>, cache: Map<string, string>) => {
  const cached = cache.get(transaction.id);
  if (cached) return cached;

  const parentId = transaction.recorrencia_transacao_pai_id;
  if (!parentId) {
    cache.set(transaction.id, transaction.id);
    return transaction.id;
  }

  const parent = byId.get(parentId);
  if (!parent || parent.id === transaction.id) {
    cache.set(transaction.id, transaction.id);
    return transaction.id;
  }

  const rootId = getRootId(parent, byId, cache);
  cache.set(transaction.id, rootId);
  return rootId;
};

const calculateMedian = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const inferCadence = (medianGapDays: number | null): TransactionCadence => {
  if (medianGapDays === null) return 'irregular';
  if (medianGapDays <= 8) return 'semanal';
  if (medianGapDays <= 17) return 'quinzenal';
  if (medianGapDays <= 35) return 'mensal';
  if (medianGapDays <= 75) return 'bimestral';
  if (medianGapDays <= 110) return 'trimestral';
  return 'irregular';
};

const buildPatternLabel = (transactions: Transaction[]) => {
  const first = transactions[0];
  if (!first) return 'Sem nome';
  return stripRecurrenceSuffix(first.nome || 'Sem nome') || first.nome || 'Sem nome';
};

const buildSeriesKey = (
  transaction: Transaction,
  byId: Map<string, Transaction>,
  cache: Map<string, string>,
) => {
  const normalizedName = normalizeText(stripRecurrenceSuffix(transaction.nome || ''));
  const amount = roundMoney(transaction.valor).toFixed(2);

  if (hasRecurrenceLineage(transaction)) {
    const rootId = getRootId(transaction, byId, cache);
    return `recurrence:${rootId}:${transaction.tipo}:${amount}`;
  }

  return `merchant:${normalizedName}:${transaction.tipo}:${amount}`;
};

export const dedupeRecurringTransactions = (transactions: Transaction[]) => {
  const byId = new Map(transactions.map((transaction) => [transaction.id, transaction] as const));
  const rootCache = new Map<string, string>();
  const seen = new Set<string>();

  return transactions.filter((transaction) => {
    if (!hasRecurrenceLineage(transaction)) return true;

    const rootId = getRootId(transaction, byId, rootCache);
    const key = [
      rootId,
      transaction.tipo,
      roundMoney(transaction.valor).toFixed(2),
      transaction.data,
      transaction.status,
    ].join('|');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const analyzeTransactionPatterns = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date,
): TransactionPatternSummary => {
  const scoped = transactions.filter((transaction) => {
    if (transaction.origem !== workspace) return false;
    if (transaction.deletado) return false;
    if (transaction.status === 'cancelada') return false;
    return true;
  }).filter((transaction) => {
    if (!startDate || !endDate) return true;
    const date = parseFinancialDate(transaction.data);
    return date >= startDate && date <= endDate;
  });

  const byId = new Map(scoped.map((transaction) => [transaction.id, transaction] as const));
  const rootCache = new Map<string, string>();
  const groups = new Map<string, Transaction[]>();

  for (const transaction of scoped) {
    const key = buildSeriesKey(transaction, byId, rootCache);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(transaction);
  }

  const patterns = Array.from(groups.entries())
    .map(([key, group]) => {
      const uniqueDateMap = new Map<string, Transaction>();
      for (const transaction of group) {
        uniqueDateMap.set(transaction.data, transaction);
      }

      const uniqueDates = Array.from(uniqueDateMap.keys()).sort();
      const orderedTransactions = Array.from(uniqueDateMap.values()).sort(
        (a, b) => parseFinancialDate(a.data).getTime() - parseFinancialDate(b.data).getTime(),
      );

      const gaps = orderedTransactions
        .slice(1)
        .map((transaction, index) => {
          const current = parseFinancialDate(transaction.data);
          const previous = parseFinancialDate(orderedTransactions[index].data);
          return differenceInCalendarDays(current, previous);
        })
        .filter((gap) => Number.isFinite(gap));

      const averageGapDays = gaps.length
        ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
        : null;
      const medianGapDays = calculateMedian(gaps);
      const cadence = inferCadence(medianGapDays);
      const inflationRows = Math.max(0, group.length - uniqueDates.length);
      const cadenceTarget = cadence === 'semanal'
        ? 7
        : cadence === 'quinzenal'
          ? 15
          : cadence === 'mensal'
            ? 30
            : cadence === 'bimestral'
              ? 60
              : cadence === 'trimestral'
                ? 90
                : null;
      const cadenceBonus = cadenceTarget && medianGapDays !== null
        ? Math.max(0, 35 - Math.min(35, Math.abs(cadenceTarget - medianGapDays)))
        : 0;
      const recurrenceScore = Math.min(100, Math.round(
        group.length * 7 +
        uniqueDates.length * 3 +
        cadenceBonus +
        (inflationRows > 0 ? 12 : 0),
      ));

      return {
        key,
        label: buildPatternLabel(group),
        normalizedLabel: normalizeText(stripRecurrenceSuffix(group[0]?.nome || '')),
        direction: group[0]?.tipo || 'saida',
        amount: group[0]?.valor || 0,
        rowCount: group.length,
        uniqueDateCount: uniqueDates.length,
        firstDate: uniqueDates[0] || group[0]?.data || '',
        lastDate: uniqueDates[uniqueDates.length - 1] || group[group.length - 1]?.data || '',
        averageGapDays,
        medianGapDays,
        cadence,
        recurrenceScore,
        inflationRows,
        inflationRisk: inflationRows > 0 || group.length >= 6 && uniqueDates.length <= 3,
        sampleNames: Array.from(new Set(group.map((transaction) => transaction.nome))).slice(0, 3),
        sampleDates: uniqueDates.slice(0, 3),
      } satisfies TransactionPatternInsight;
    })
    .filter((pattern) => pattern.rowCount >= 3)
    .sort((a, b) => b.recurrenceScore - a.recurrenceScore || b.rowCount - a.rowCount || b.uniqueDateCount - a.uniqueDateCount);

  const recurringIncome = patterns.filter((pattern) => pattern.direction === 'entrada');
  const recurringExpenses = patterns.filter((pattern) => pattern.direction === 'saida');
  const inflatedSeries = patterns.filter((pattern) => pattern.inflationRisk);

  return {
    totalPatterns: patterns.length,
    recurringIncomePatterns: recurringIncome.length,
    recurringExpensePatterns: recurringExpenses.length,
    inflatedSeriesCount: inflatedSeries.length,
    topPatterns: patterns.slice(0, 8),
    recurringIncome: recurringIncome.slice(0, 5),
    recurringExpenses: recurringExpenses.slice(0, 5),
    inflatedSeries: inflatedSeries.slice(0, 5),
  };
};

export const formatPatternCadence = (cadence: TransactionCadence) => {
  switch (cadence) {
    case 'semanal':
      return 'Semanal';
    case 'quinzenal':
      return 'Quinzenal';
    case 'mensal':
      return 'Mensal';
    case 'bimestral':
      return 'Bimestral';
    case 'trimestral':
      return 'Trimestral';
    default:
      return 'Irregular';
  }
};

export const formatPatternSpan = (pattern: TransactionPatternInsight) => {
  if (!pattern.firstDate || !pattern.lastDate) return '--';
  return `${pattern.firstDate} -> ${pattern.lastDate}`;
};
