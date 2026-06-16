import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Transaction } from '@/types/financial';
import { buildPeriodMonthlySummary } from '@/lib/financialAnalytics';
import { ArrowDownRight, ArrowUpRight, CalendarDays, Flame, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialPeriodInsightsCardProps {
  transactions: Transaction[];
  categories: Category[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const MetricBlock: React.FC<{ label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }> = ({ label, value, tone = 'neutral' }) => (
  <div className={cn(
    'rounded-2xl border p-3',
    tone === 'good' ? 'border-emerald-500/20 bg-emerald-500/10' : tone === 'bad' ? 'border-rose-500/20 bg-rose-500/10' : 'border-border/60 bg-surface/70',
  )}>
    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
    <div className="mt-1 text-base font-semibold text-foreground">{value}</div>
  </div>
);

const FinancialPeriodInsightsCard: React.FC<FinancialPeriodInsightsCardProps> = ({
  transactions,
  categories,
  workspace,
  startDate,
  endDate,
}) => {
  const insights = useMemo(
    () => buildPeriodMonthlySummary(transactions, workspace, categories, startDate, endDate),
    [transactions, categories, workspace, startDate, endDate],
  );

  const monthRangeLabel = insights.months.length > 0
    ? `${insights.months[0]?.monthLabel} → ${insights.months[insights.months.length - 1]?.monthLabel}`
    : 'Sem período';

  return (
    <Card variant="soft" className="overflow-hidden border-border/60 bg-background/95 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          Mapa do período
        </CardTitle>
        <CardDescription>
          Leitura histórica por mês e por dia do mês com categoria propagada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full border-border/60 bg-surface/70 px-3 py-1">
            {monthRangeLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/60 bg-surface/70 px-3 py-1">
            {insights.months.length} meses analisados
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricBlock
            label="Melhor mês"
            value={insights.bestMonth ? `${insights.bestMonth.monthLabel} · ${currency(insights.bestMonth.saldoReal)}` : '--'}
            tone="good"
          />
          <MetricBlock
            label="Pior mês"
            value={insights.worstMonth ? `${insights.worstMonth.monthLabel} · ${currency(insights.worstMonth.saldoReal)}` : '--'}
            tone="bad"
          />
          <MetricBlock
            label="Dia forte de entrada"
            value={insights.strongestIncomeDay ? `Dia ${insights.strongestIncomeDay.day} · ${currency(insights.strongestIncomeDay.entradas)}` : '--'}
            tone="good"
          />
          <MetricBlock
            label="Dia forte de saída"
            value={insights.strongestExpenseDay ? `Dia ${insights.strongestExpenseDay.day} · ${currency(insights.strongestExpenseDay.saidas)}` : '--'}
            tone="bad"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Maiores receitas
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-muted-foreground">{insights.topIncomeCategory?.categoryName || 'Sem categoria'}</span>
                <span className="font-semibold text-foreground">{insights.topIncomeCategory ? currency(insights.topIncomeCategory.value) : '--'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Média diária: {currency(insights.dailyAverageIncome)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingDown className="h-4 w-4 text-rose-500" />
              Maiores despesas
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-muted-foreground">{insights.topExpenseCategory?.categoryName || 'Sem categoria'}</span>
                <span className="font-semibold text-foreground">{insights.topExpenseCategory ? currency(insights.topExpenseCategory.value) : '--'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Média diária: {currency(insights.dailyAverageExpense)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Flame className="h-4 w-4 text-primary" />
              Consolidação mensal
            </div>
            <div className="text-xs text-muted-foreground">
              {insights.months.length} períodos
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {insights.months.slice(-6).map((month) => (
              <div key={month.monthKey} className="rounded-2xl border border-border/60 bg-surface/70 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{month.monthLabel}</div>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Saldo real</span>
                  <span className={cn('font-semibold', month.saldoReal >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300')}>
                    {currency(month.saldoReal)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Saldo proj.</span>
                  <span className={cn('font-semibold', month.saldoProjetado >= 0 ? 'text-sky-600 dark:text-sky-300' : 'text-rose-600 dark:text-rose-300')}>
                    {currency(month.saldoProjetado)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{currency(month.entradasRealizadas)} recebidos</span>
                  <span>{currency(month.saidasRealizadas)} pagos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialPeriodInsightsCard;
