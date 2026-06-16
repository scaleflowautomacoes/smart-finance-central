import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarRange, Dot, Flag, Landmark, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateRangeState } from '@/components/DateRangeFilter';
import { Goal, Transaction } from '@/types/financial';
import { FinancialMetricsCore } from '@/hooks/useFinancialMetricsCore';
import { buildOperationalWindowSummary, deriveFinancePulse, formatBRL, formatPercentage, getActiveGoal } from '@/utils/financeNarrative';
import { cn } from '@/lib/utils';

interface ExecutiveReportStripProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  metrics: {
    current: FinancialMetricsCore;
    previousWindow: FinancialMetricsCore;
    previousYear: FinancialMetricsCore | null;
    variationWindow: { entradas: number; saidas: number; saldo: number };
    variationYear: { entradas: number; saidas: number; saldo: number } | null;
  };
  goals?: Goal[];
  dateRange: DateRangeState;
}

const statusStyles = {
  healthy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  opportunity: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  attention: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  critical: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
} as const;

const metricStyles = {
  positive: 'text-emerald-700 dark:text-emerald-300',
  neutral: 'text-foreground',
  caution: 'text-amber-700 dark:text-amber-300',
  negative: 'text-rose-700 dark:text-rose-300',
} as const;

const ExecutiveReportStrip: React.FC<ExecutiveReportStripProps> = ({ workspace, transactions, metrics, goals, dateRange }) => {
  const activeGoal = useMemo(() => getActiveGoal(goals, workspace), [goals, workspace]);
  const windowSummary = useMemo(
    () => buildOperationalWindowSummary(transactions, workspace, dateRange.startDate, dateRange.endDate),
    [transactions, workspace, dateRange.startDate, dateRange.endDate],
  );
  const pulse = useMemo(() => deriveFinancePulse(metrics.current, activeGoal, windowSummary), [metrics, activeGoal, windowSummary]);

  const executiveTiles = [
    {
      label: 'Saldo projetado',
      value: formatBRL(metrics.current.saldoProjetado),
      hint: `${metrics.variationWindow.saldo >= 0 ? '+' : ''}${metrics.variationWindow.saldo.toFixed(1)}% vs janela anterior`,
      icon: Landmark,
      tone: metrics.current.saldoProjetado >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Entradas totais',
      value: formatBRL(metrics.current.totalEntradas),
      hint: `${formatBRL(metrics.current.entradasRealizadas)} realizadas`,
      icon: ArrowUpRight,
      tone: 'positive',
    },
    {
      label: 'Saídas totais',
      value: formatBRL(metrics.current.totalSaidas),
      hint: `${formatBRL(metrics.current.saidasRealizadas)} realizadas`,
      icon: ArrowDownRight,
      tone: metrics.current.totalSaidas > metrics.current.totalEntradas ? 'negative' : 'caution',
    },
    {
      label: 'Caixa livre',
      value: formatBRL(pulse.cashFree),
      hint: `${formatBRL(pulse.cashCommitted)} comprometidos`,
      icon: Wallet,
      tone: pulse.cashFree >= 0 ? 'neutral' : 'negative',
    },
  ] as const;

  return (
    <Card
      variant="soft"
      className="overflow-hidden border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_45%)]" />
      <CardHeader className="relative gap-4 pb-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                Relatórios executivos
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
                {dateRange.presetName === 'tudo' ? 'Histórico completo' : 'Período filtrado'}
              </Badge>
              <Badge variant="outline" className={cn('rounded-full px-3 py-1 text-[11px] font-medium', statusStyles[pulse.status])}>
                <Dot className="-ml-1 mr-1 h-4 w-4" />
                {pulse.title}
              </Badge>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground lg:text-[2rem]">
                Caixa, categorias e resultado na mesma leitura analítica.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Uma visão editorial do período para comparar receita, despesa, saldo e concentração por categoria sem perder ritmo nem legibilidade.
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[25rem]">
            <div className="rounded-[1.35rem] border border-border/60 bg-background/90 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
                <Badge variant="outline" className="rounded-full border-border/60 bg-surface/80 px-2.5 py-0.5 text-[11px]">
                  {workspace}
                </Badge>
              </div>
              <div className="mt-2 text-base font-semibold text-foreground">{metrics.current.healthScore}</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{pulse.description}</p>
            </div>

            <div className="rounded-[1.35rem] border border-border/60 bg-background/90 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Meta ativa</div>
                <Flag className="h-4 w-4 text-primary/70" />
              </div>
              <div className="mt-2 text-base font-semibold text-foreground">{pulse.goalLabel || 'Sem meta ativa'}</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {pulse.goalLabel ? `${formatPercentage(pulse.goalProgress)} concluído • gap ${formatBRL(pulse.goalGap ?? 0)}` : 'Configure uma meta para acompanhar o desvio com mais precisão.'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {executiveTiles.map((tile) => {
            const Icon = tile.icon;

            return (
              <div
                key={tile.label}
                className="rounded-[1.35rem] border border-border/60 bg-background/88 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.22)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{tile.label}</div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className={cn('mt-2 text-[1.65rem] font-semibold tracking-tight', metricStyles[tile.tone])}>{tile.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{tile.hint}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 border-t border-border/60 pt-4 lg:grid-cols-3">
          <div className="rounded-[1.2rem] border border-border/60 bg-surface/80 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Pendências de cobrança</div>
            <div className="mt-2 text-lg font-semibold text-foreground">{formatBRL(windowSummary.pendingReceipts)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{formatBRL(windowSummary.overdueReceipts)} vencidos aguardando ação</div>
          </div>
          <div className="rounded-[1.2rem] border border-border/60 bg-surface/80 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Pagamentos em janela</div>
            <div className="mt-2 text-lg font-semibold text-foreground">{formatBRL(windowSummary.next30Payments)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{formatBRL(windowSummary.next15Payments)} vencem nos próximos 15 dias</div>
          </div>
          <div className="rounded-[1.2rem] border border-border/60 bg-surface/80 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Relação despesa/receita</div>
            <div className="mt-2 text-lg font-semibold text-foreground">{metrics.current.despesasReceitasRatio.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">Leitura de eficiência operacional do recorte atual</div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-[1.2rem] border border-border/60 bg-background/80 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Comparação base</div>
            <div className="mt-2 text-sm font-medium text-foreground">Janela anterior</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatBRL(metrics.previousWindow.totalEntradas)} em entradas, {formatBRL(metrics.previousWindow.totalSaidas)} em saídas.
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-border/60 bg-background/80 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Comparação anual</div>
            <div className="mt-2 text-sm font-medium text-foreground">
              {metrics.previousYear ? 'Mesmo período do ano anterior' : 'Sem base anual suficiente'}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {metrics.previousYear
                ? `${formatBRL(metrics.previousYear.totalEntradas)} em entradas, ${formatBRL(metrics.previousYear.totalSaidas)} em saídas.`
                : 'Quando houver histórico anual, essa leitura aparece aqui automaticamente.'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveReportStrip;
