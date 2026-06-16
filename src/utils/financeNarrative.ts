import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { DashboardMetrics, Goal, Transaction } from '@/types/financial';
import { parseFinancialDate } from '@/utils/financialDate';

export type FinancePulseStatus = 'healthy' | 'opportunity' | 'attention' | 'critical';

export interface OperationalWindowSummary {
  pendingReceipts: number;
  pendingPayments: number;
  overdueReceipts: number;
  overduePayments: number;
  next15Receipts: number;
  next15Payments: number;
  next30Receipts: number;
  next30Payments: number;
  criticalItems: number;
}

export interface FinancePulse {
  status: FinancePulseStatus;
  title: string;
  description: string;
  cashFree: number;
  cashCommitted: number;
  goalGap: number | null;
  goalProgress: number | null;
  goalLabel: string | null;
}

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const getActiveGoal = (goals: Goal[] | undefined, workspace: 'PF' | 'PJ') => {
  if (!goals || goals.length === 0) return null;

  const activeGoals = goals
    .filter((goal) => goal.workspace === workspace && goal.status === 'active')
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  return activeGoals[0] ?? null;
};

export const buildOperationalWindowSummary = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  startDate?: Date,
  endDate?: Date,
): OperationalWindowSummary => {
  const today = startOfDay(new Date());
  const window15 = addDays(today, 15);
  const window30 = addDays(today, 30);

  return transactions.reduce<OperationalWindowSummary>((acc, transaction) => {
    if (transaction.origem !== workspace || transaction.deletado || transaction.status === 'cancelada') {
      return acc;
    }

    if (transaction.status === 'realizada') {
      return acc;
    }

    const date = parseFinancialDate(transaction.data);
    if (startDate && endDate) {
      const currentStart = startOfDay(startDate);
      const currentEnd = startOfDay(endDate);
      if (isBefore(date, currentStart) || isAfter(date, currentEnd)) {
        return acc;
      }
    }

    const isReceipt = transaction.tipo === 'entrada';
    const isPayment = transaction.tipo === 'saida';
    const isOverdue = isBefore(date, today);
    const within15 = !isBefore(date, today) && !isAfter(date, window15);
    const within30 = !isBefore(date, today) && !isAfter(date, window30);

    if (isReceipt) {
      acc.pendingReceipts += transaction.valor;
      if (isOverdue) acc.overdueReceipts += transaction.valor;
      if (within15) acc.next15Receipts += transaction.valor;
      if (within30) acc.next30Receipts += transaction.valor;
    }

    if (isPayment) {
      acc.pendingPayments += transaction.valor;
      if (isOverdue) acc.overduePayments += transaction.valor;
      if (within15) acc.next15Payments += transaction.valor;
      if (within30) acc.next30Payments += transaction.valor;
    }

    return acc;
  }, {
    pendingReceipts: 0,
    pendingPayments: 0,
    overdueReceipts: 0,
    overduePayments: 0,
    next15Receipts: 0,
    next15Payments: 0,
    next30Receipts: 0,
    next30Payments: 0,
    criticalItems: 0,
  });
};

export const deriveFinancePulse = (
  metrics: DashboardMetrics,
  goal: Goal | null,
  summary: OperationalWindowSummary,
): FinancePulse => {
  const cashCommitted = summary.pendingPayments + summary.overduePayments;
  const cashFree = metrics.saldoReal - cashCommitted;
  const goalProgress = goal ? (goal.current_amount / goal.target_amount) * 100 : null;
  const goalGap = goal ? Math.max(goal.target_amount - goal.current_amount, 0) : null;

  if (metrics.saldoProjetado < 0 || summary.overduePayments > summary.pendingReceipts + metrics.entradasRealizadas) {
    return {
      status: 'critical',
      title: 'Caixa em risco',
      description: 'As obrigações superam a folga atual. É hora de cobrar e segurar desembolsos.',
      cashFree,
      cashCommitted,
      goalGap,
      goalProgress,
      goalLabel: goal ? goal.name : null,
    };
  }

  if (summary.overdueReceipts > 0 || summary.overduePayments > 0 || metrics.despesasReceitasRatio > 82) {
    return {
      status: 'attention',
      title: 'Caixa sob atenção',
      description: 'Há pendências ou pressão de despesas suficiente para merecer acompanhamento diário.',
      cashFree,
      cashCommitted,
      goalGap,
      goalProgress,
      goalLabel: goal ? goal.name : null,
    };
  }

  if (goal && goalProgress !== null && goalProgress >= 80) {
    return {
      status: 'opportunity',
      title: 'Meta em alcance',
      description: 'A operação está perto da meta. É um bom momento para proteger caixa e investir com critério.',
      cashFree,
      cashCommitted,
      goalGap,
      goalProgress,
      goalLabel: goal.name,
    };
  }

  return {
    status: 'healthy',
    title: 'Caixa controlado',
    description: 'O dia está sob controle e a leitura do mês segue coerente com o histórico.',
    cashFree,
    cashCommitted,
    goalGap,
    goalProgress,
    goalLabel: goal ? goal.name : null,
  };
};

export const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatPercentage = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return '--';
  return `${Math.min(999, Math.max(0, value)).toFixed(1)}%`;
};

export const formatShortDate = (value: string) => toIsoDate(parseFinancialDate(value));
