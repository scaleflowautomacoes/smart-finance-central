import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { formatCurrency, CHART_COLORS } from '@/utils/chartColors';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  compareFinancialDateStrings,
  isFinancialDateWithinRange,
  parseFinancialDate,
} from '@/utils/financialDate';
import { dedupeGeneratedRecurrences } from '@/lib/financialAnalytics';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';

interface CashFlowAreaProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color?: string;
  fill?: string;
}

interface TooltipState {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CashFlowArea: React.FC<CashFlowAreaProps> = ({ transactions, workspace, startDate, endDate }) => {
  const chartData = useMemo(() => {
    const filteredTransactions = dedupeGeneratedRecurrences(transactions).filter((transaction) => {
      if (transaction.origem !== workspace || transaction.deletado || transaction.status !== 'realizada') return false;
      return isFinancialDateWithinRange(transaction.data, startDate, endDate);
    });

    if (filteredTransactions.length === 0) {
      return [];
    }

    const sortedTransactions = [...filteredTransactions].sort((a, b) =>
      compareFinancialDateStrings(a.data, b.data),
    );

    const monthlyData: Record<string, { receitas: number; despesas: number }> = {};

    const rangeStart = startDate
      ? startOfMonth(startDate)
      : startOfMonth(parseFinancialDate(sortedTransactions[0].data));
    const rangeEnd = endDate
      ? endOfMonth(endDate)
      : endOfMonth(parseFinancialDate(sortedTransactions[sortedTransactions.length - 1].data));

    let current = new Date(rangeStart);

    while (current <= rangeEnd) {
      const key = format(current, 'MMM/yy', { locale: ptBR });
      monthlyData[key] = { receitas: 0, despesas: 0 };
      current = startOfMonth(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }

    filteredTransactions.forEach((transaction) => {
      const monthKey = format(parseFinancialDate(transaction.data), 'MMM/yy', { locale: ptBR });
      if (!monthlyData[monthKey]) return;

      if (transaction.tipo === 'entrada') {
        monthlyData[monthKey].receitas += transaction.valor;
      } else {
        monthlyData[monthKey].despesas += transaction.valor;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      Receitas: data.receitas,
      Despesas: data.despesas,
      saldo: data.receitas - data.despesas,
    }));
  }, [transactions, workspace, startDate, endDate]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, item) => {
        acc.receitas += item.Receitas;
        acc.despesas += item.Despesas;
        acc.saldo += item.saldo;
        return acc;
      },
      { receitas: 0, despesas: 0, saldo: 0 },
    );
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: TooltipState) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="min-w-[190px] rounded-2xl border border-border/70 bg-background/95 p-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}
            </div>
            <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChartCard
      title="Fluxo realizado do período"
      headerRight={
        <Badge variant="outline" className="rounded-full border-border/60 bg-surface/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Receitas vs despesas
        </Badge>
      }
      contentClassName="space-y-5"
      className="border-border/60 bg-background/95"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Receitas</div>
          <div className="mt-2 text-lg font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(totals.receitas)}</div>
        </div>
        <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Despesas</div>
          <div className="mt-2 text-lg font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(totals.despesas)}</div>
        </div>
        <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Saldo líquido</div>
          <div className="mt-2 text-lg font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(totals.saldo)}</div>
        </div>
      </div>

      <div className="h-[22rem]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.income.main} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={CHART_COLORS.income.main} stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.expense.main} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.expense.main} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.neutral[200]} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_COLORS.neutral[500], fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: CHART_COLORS.neutral[500], fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: CHART_COLORS.neutral[500], paddingTop: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="Receitas"
                name="Receitas"
                stroke={CHART_COLORS.income.main}
                strokeWidth={2}
                fill="url(#incomeArea)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="Despesas"
                name="Despesas"
                stroke={CHART_COLORS.expense.main}
                strokeWidth={2}
                fill="url(#expenseArea)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-surface/70 px-6 text-center">
            <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/60" />
            <div className="text-sm font-medium text-foreground">Sem fluxo realizado no período.</div>
            <div className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              Quando houver receitas e despesas concluídas dentro do recorte, o gráfico mensal aparece aqui.
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
};

export default CashFlowArea;
