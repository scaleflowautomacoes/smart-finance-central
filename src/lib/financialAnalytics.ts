import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Category, Transaction } from '@/types/financial';
import { isFinancialDateWithinRange, parseFinancialDate } from '@/utils/financialDate';

export interface PeriodMonthlySummary {
  monthKey: string;
  monthLabel: string;
  firstDay: Date;
  lastDay: Date;
  entradasRealizadas: number;
  entradasPrevistas: number;
  saidasRealizadas: number;
  saidasPrevistas: number;
  saldoReal: number;
  saldoProjetado: number;
}

export interface PeriodDaySummary {
  day: number;
  entradas: number;
  saidas: number;
  saldo: number;
  transactionCount: number;
}

export interface PeriodBehaviorInsight {
  bestMonth?: PeriodMonthlySummary;
  worstMonth?: PeriodMonthlySummary;
  strongestIncomeDay?: PeriodDaySummary;
  strongestExpenseDay?: PeriodDaySummary;
  topIncomeCategory?: { categoryId: string; categoryName: string; value: number };
  topExpenseCategory?: { categoryId: string; categoryName: string; value: number };
  dailyAverageIncome: number;
  dailyAverageExpense: number;
  trendMonths: PeriodMonthlySummary[];
}

export interface DerivedCategoryMapResult {
  byCanonicalKey: Map<string, string>;
  effectiveCategoryIdByTransactionId: Map<string, string>;
}

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const stripRecurrenceSuffix = (value: string) =>
  value.replace(/(\s*\(\d+\/\d+\))+$/g, '').trim();

const hasRecurrenceLineage = (transaction: Transaction) =>
  Boolean(transaction.is_recorrente) ||
  Boolean(transaction.recorrencia_transacao_pai_id) ||
  Boolean(transaction.recorrencia_tipo) ||
  Boolean(transaction.recorrencia_total_ocorrencias);

const getRootId = (transaction: Transaction, byId: Map<string, Transaction>, cache: Map<string, string>): string => {
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

export const buildCanonicalMerchantKey = (
  transaction: Pick<Transaction, 'nome' | 'observacoes' | 'origem' | 'tipo' | 'valor' | 'recorrencia_transacao_pai_id' | 'is_recorrente' | 'recorrencia_tipo' | 'recorrencia_total_ocorrencias' | 'id'>,
): string => {
  const normalizedName = normalizeText(stripRecurrenceSuffix([transaction.nome, transaction.observacoes].filter(Boolean).join(' ')));
  const recurrenceRoot = transaction.recorrencia_transacao_pai_id || (transaction.is_recorrente ? transaction.id : null);
  const recurrenceKey = recurrenceRoot ? `rec:${recurrenceRoot}` : `m:${normalizedName}`;

  return [transaction.origem, transaction.tipo, recurrenceKey].join('|');
};

export const dedupeGeneratedRecurrences = (transactions: Transaction[]) => {
  const byId = new Map(transactions.map((transaction) => [transaction.id, transaction] as const));
  const rootCache = new Map<string, string>();
  const seen = new Set<string>();

  return transactions.filter((transaction) => {
    if (!hasRecurrenceLineage(transaction)) return true;

    const rootId = getRootId(transaction, byId, rootCache);
    const key = [
      rootId,
      transaction.tipo,
      transaction.valor.toFixed(2),
      transaction.data,
      transaction.status,
    ].join('|');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const buildDerivedCategoryMap = (transactions: Transaction[]): DerivedCategoryMapResult => {
  const byCanonicalKey = new Map<string, string>();
  const counts = new Map<string, Map<string, { count: number; lastDate: string }>>();

  for (const transaction of transactions) {
    if (!transaction.categoria_id || transaction.deletado) continue;

    const key = buildCanonicalMerchantKey(transaction);
    if (!counts.has(key)) counts.set(key, new Map());

    const bucket = counts.get(key)!;
    const current = bucket.get(transaction.categoria_id) || { count: 0, lastDate: '' };
    current.count += 1;
    if (!current.lastDate || transaction.data > current.lastDate) {
      current.lastDate = transaction.data;
    }
    bucket.set(transaction.categoria_id, current);
  }

  for (const [key, bucket] of counts.entries()) {
    const winner = Array.from(bucket.entries()).sort((a, b) => {
      const countDiff = b[1].count - a[1].count;
      if (countDiff !== 0) return countDiff;
      return b[1].lastDate.localeCompare(a[1].lastDate);
    })[0];

    if (winner) {
      byCanonicalKey.set(key, winner[0]);
    }
  }

  const effectiveCategoryIdByTransactionId = new Map<string, string>();
  for (const transaction of transactions) {
    const key = buildCanonicalMerchantKey(transaction);
    const derived = byCanonicalKey.get(key) || transaction.categoria_id || '';
    if (derived) {
      effectiveCategoryIdByTransactionId.set(transaction.id, derived);
    }
  }

  return {
    byCanonicalKey,
    effectiveCategoryIdByTransactionId,
  };
};

export const resolveEffectiveCategoryId = (
  transaction: Transaction,
  derivedMap?: DerivedCategoryMapResult,
) => {
  if (derivedMap) {
    return derivedMap.effectiveCategoryIdByTransactionId.get(transaction.id) || transaction.categoria_id || null;
  }

  return transaction.categoria_id || null;
};

export const filterTransactionsForPeriod = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date,
  options: { includeDeleted?: boolean; includeCancelled?: boolean; includeInactiveRecurrences?: boolean } = {},
) => {
  const {
    includeDeleted = false,
    includeCancelled = false,
    includeInactiveRecurrences = false,
  } = options;

  return transactions.filter((transaction) => {
    if (transaction.origem !== workspace) return false;
    if (!includeDeleted && transaction.deletado) return false;
    if (!includeCancelled && transaction.status === 'cancelada') return false;
    if (!includeInactiveRecurrences && transaction.recorrencia_ativa === false) return false;
    if (startDate && endDate && !isFinancialDateWithinRange(transaction.data, startDate, endDate)) return false;
    return true;
  });
};

export const buildPeriodMonthlySummary = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  categories: Category[],
  startDate?: Date,
  endDate?: Date,
) => {
  const scope = dedupeGeneratedRecurrences(filterTransactionsForPeriod(transactions, workspace, startDate, endDate));
  const derivedCategories = buildDerivedCategoryMap(scope);
  const monthMap = new Map<string, PeriodMonthlySummary>();

  const allDates = scope.map((transaction) => parseFinancialDate(transaction.data));
  const minDate = startDate
    ? startOfMonth(startDate)
    : (allDates.length > 0 ? startOfMonth(new Date(Math.min(...allDates.map((date) => date.getTime())))) : startOfMonth(new Date()));
  const maxDate = endDate
    ? endOfMonth(endDate)
    : (allDates.length > 0 ? endOfMonth(new Date(Math.max(...allDates.map((date) => date.getTime())))) : endOfMonth(new Date()));

  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cursor <= maxDate) {
    const monthKey = format(cursor, 'yyyy-MM');
    monthMap.set(monthKey, {
      monthKey,
      monthLabel: format(cursor, 'MMM/yyyy', { locale: ptBR }),
      firstDay: new Date(cursor),
      lastDay: endOfMonth(cursor),
      entradasRealizadas: 0,
      entradasPrevistas: 0,
      saidasRealizadas: 0,
      saidasPrevistas: 0,
      saldoReal: 0,
      saldoProjetado: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const transaction of scope) {
    const monthKey = format(parseFinancialDate(transaction.data), 'yyyy-MM');
    const bucket = monthMap.get(monthKey);
    if (!bucket) continue;

    if (transaction.tipo === 'entrada') {
      if (transaction.status === 'realizada') bucket.entradasRealizadas += transaction.valor;
      else bucket.entradasPrevistas += transaction.valor;
    } else {
      if (transaction.status === 'realizada') bucket.saidasRealizadas += transaction.valor;
      else bucket.saidasPrevistas += transaction.valor;
    }
  }

  const months = Array.from(monthMap.values()).map((month) => ({
    ...month,
    saldoReal: month.entradasRealizadas - month.saidasRealizadas,
    saldoProjetado: (month.entradasRealizadas + month.entradasPrevistas) - (month.saidasRealizadas + month.saidasPrevistas),
  }));

  const bestMonth = months
    .filter((month) => month.entradasRealizadas + month.saidasRealizadas > 0)
    .sort((a, b) => (b.saldoReal - a.saldoReal) || (b.entradasRealizadas - a.entradasRealizadas))[0];

  const worstMonth = months
    .filter((month) => month.entradasRealizadas + month.saidasRealizadas > 0)
    .sort((a, b) => (a.saldoReal - b.saldoReal) || (b.saidasRealizadas - a.saidasRealizadas))[0];

  const dayMap = new Map<number, PeriodDaySummary>();
  for (let day = 1; day <= 31; day += 1) {
    dayMap.set(day, { day, entradas: 0, saidas: 0, saldo: 0, transactionCount: 0 });
  }

  for (const transaction of scope) {
    const day = parseFinancialDate(transaction.data).getDate();
    const bucket = dayMap.get(day);
    if (!bucket) continue;
    if (transaction.tipo === 'entrada') bucket.entradas += transaction.valor;
    else bucket.saidas += transaction.valor;
    bucket.transactionCount += 1;
  }

  const days = Array.from(dayMap.values()).map((item) => ({
    ...item,
    saldo: item.entradas - item.saidas,
  }));

  const strongestIncomeDay = days.sort((a, b) => b.entradas - a.entradas || b.transactionCount - a.transactionCount)[0];
  const strongestExpenseDay = [...days].sort((a, b) => b.saidas - a.saidas || b.transactionCount - a.transactionCount)[0];

  const categoryTotals = new Map<string, { name: string; income: number; expense: number }>();
  for (const transaction of scope) {
    const categoryId = resolveEffectiveCategoryId(transaction, derivedCategories) || 'Sem categoria';
    const categoryName = categories.find((category) => category.id === categoryId)?.nome || 'Sem categoria';
    const current = categoryTotals.get(categoryId) || { name: categoryName, income: 0, expense: 0 };
    if (transaction.tipo === 'entrada') current.income += transaction.valor;
    else current.expense += transaction.valor;
    categoryTotals.set(categoryId, current);
  }

  const topIncomeCategory = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1].income - a[1].income)[0];
  const topExpenseCategory = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1].expense - a[1].expense)[0];

  const realizedIncomeDays = new Set(
    scope.filter((transaction) => transaction.tipo === 'entrada' && transaction.status === 'realizada').map((transaction) => transaction.data),
  ).size || 1;
  const realizedExpenseDays = new Set(
    scope.filter((transaction) => transaction.tipo === 'saida' && transaction.status === 'realizada').map((transaction) => transaction.data),
  ).size || 1;

  return {
    derivedCategories,
    trendMonths: months,
    months,
    bestMonth,
    worstMonth,
    strongestIncomeDay,
    strongestExpenseDay,
    topIncomeCategory: topIncomeCategory ? {
      categoryId: topIncomeCategory[0],
      categoryName: topIncomeCategory[1].name,
      value: topIncomeCategory[1].income,
    } : undefined,
    topExpenseCategory: topExpenseCategory ? {
      categoryId: topExpenseCategory[0],
      categoryName: topExpenseCategory[1].name,
      value: topExpenseCategory[1].expense,
    } : undefined,
    dailyAverageIncome: months.length > 0 ? scope.filter((transaction) => transaction.tipo === 'entrada').reduce((sum, transaction) => sum + transaction.valor, 0) / realizedIncomeDays : 0,
    dailyAverageExpense: months.length > 0 ? scope.filter((transaction) => transaction.tipo === 'saida').reduce((sum, transaction) => sum + transaction.valor, 0) / realizedExpenseDays : 0,
  } satisfies PeriodBehaviorInsight & { derivedCategories: DerivedCategoryMapResult; months: PeriodMonthlySummary[] };
};
