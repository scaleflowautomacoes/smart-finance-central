import React, { useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleAlert,
  CircleCheckBig,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DateRangeState } from '@/components/DateRangeFilter';
import { DashboardMetrics, Goal, Transaction } from '@/types/financial';
import { buildOperationalWindowSummary, deriveFinancePulse, formatBRL, getActiveGoal } from '@/utils/financeNarrative';
import { cn } from '@/lib/utils';

interface ExecutiveCommandCenterProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  metrics: DashboardMetrics;
  goals?: Goal[];
  dateRange: DateRangeState;
  onRefreshData?: () => void;
  onNewTransaction: () => void;
}

const statusStyles = {
  healthy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  opportunity: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  attention: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  critical: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
} as const;

const statusIcons = {
  healthy: CircleCheckBig,
  opportunity: Sparkles,
  attention: CircleAlert,
  critical: CircleAlert,
} as const;

const metricIconTone = {
  neutral: 'text-slate-400 dark:text-slate-500',
  positive: 'text-emerald-500',
  caution: 'text-amber-500',
  risk: 'text-rose-500',
} as const;

const ExecutiveCommandCenter: React.FC<ExecutiveCommandCenterProps> = ({
  workspace,
  transactions,
  metrics,
  goals,
  dateRange,
  onRefreshData,
  onNewTransaction,
}) => {
  const activeGoal = useMemo(() => getActiveGoal(goals, workspace), [goals, workspace]);
  const windowSummary = useMemo(
    () => buildOperationalWindowSummary(transactions, workspace, dateRange.startDate, dateRange.endDate),
    [transactions, workspace, dateRange.startDate, dateRange.endDate],
  );
  const pulse = useMemo(() => deriveFinancePulse(metrics, activeGoal, windowSummary), [metrics, activeGoal, windowSummary]);
  const PulseIcon = statusIcons[pulse.status];

  const monthLabel = dateRange.presetName === 'tudo'
    ? 'Todo o historico'
    : dateRange.startDate && dateRange.endDate
      ? `${dateRange.startDate.toLocaleDateString('pt-BR')} -> ${dateRange.endDate.toLocaleDateString('pt-BR')}`
      : 'Periodo ativo';

  const primaryMetrics = [
    {
      label: 'Saldo atual',
      value: metrics.saldoReal,
      helper: 'Realizado confirmado',
      icon: ArrowUpRight,
      tone: metrics.saldoReal >= 0 ? 'positive' : 'risk' as const,
    },
    {
      label: 'Saldo projetado',
      value: metrics.saldoProjetado,
      helper: 'Realizado + previsto',
      icon: TrendingUp,
      tone: metrics.saldoProjetado >= 0 ? 'positive' : 'risk' as const,
    },
    {
      label: 'Caixa livre',
      value: pulse.cashFree,
      helper: 'Disponivel apos compromissos',
      icon: ArrowUpRight,
      tone: pulse.cashFree >= 0 ? 'positive' : 'caution' as const,
    },
    {
      label: 'Caixa comprometido',
      value: pulse.cashCommitted,
      helper: 'Pendencias e vencidos',
      icon: ArrowDownRight,
      tone: pulse.cashCommitted > 0 ? 'caution' : 'neutral' as const,
    },
  ];

  const summaryCards = [
    {
      label: 'Recebimentos pendentes',
      value: windowSummary.pendingReceipts,
      helper: `${formatBRL(windowSummary.next15Receipts)} nos proximos 15 dias`,
    },
    {
      label: 'Pagamentos pendentes',
      value: windowSummary.pendingPayments,
      helper: `${formatBRL(windowSummary.next30Payments)} nos proximos 30 dias`,
    },
    {
      label: 'Recebimentos vencidos',
      value: windowSummary.overdueReceipts,
      helper: 'Itens que merecem cobranca',
    },
    {
      label: 'Pagamentos vencidos',
      value: windowSummary.overduePayments,
      helper: 'Saidas que pressionam a projecao',
    },
  ];

  const progress = pulse.goalProgress ?? 0;

  return (
    <Card
      variant="soft"
      className="overflow-hidden border-border/60 bg-surface/95 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.22)]"
    >
      <CardContent className="p-4 lg:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-muted-foreground">
                <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                Painel do dia
              </Badge>
              <Badge variant="outline" className={cn('rounded-full px-3 py-1', statusStyles[pulse.status])}>
                <PulseIcon className="mr-2 h-3.5 w-3.5" />
                {pulse.title}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-muted-foreground">
                {workspace}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-muted-foreground">
                {monthLabel}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  05-15 recebimentos
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  25-30 pagamentos
                </span>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                    {workspace === 'PJ' ? 'Pessoa Juridica' : 'Pessoa Fisica'} com foco em caixa e previsao.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Uma leitura curta do que entrou, do que ainda falta entrar e do que ja esta comprometendo o mes.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {onRefreshData && (
                    <Button variant="outline" onClick={onRefreshData} className="rounded-xl">
                      Atualizar dados
                    </Button>
                  )}
                  <Button onClick={onNewTransaction} className="rounded-xl shadow-lg shadow-primary/15">
                    Nova transacao
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {primaryMetrics.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="min-h-[8.75rem] rounded-[1.35rem] border border-border/60 bg-background/82 p-3.5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]"
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      <span>{item.label}</span>
                      <Icon className={cn('h-4 w-4', metricIconTone[item.tone])} />
                    </div>
                    <div className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground lg:text-[1.65rem]">
                      {formatBRL(item.value)}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.helper}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <Card variant="soft" className="border-border/60 bg-background/85 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.16)]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base font-semibold text-foreground">
                  <span>Status do mes</span>
                  <Badge variant="outline" className={cn('rounded-full px-3 py-1', statusStyles[pulse.status])}>
                    {pulse.status}
                  </Badge>
                </CardTitle>
                <CardDescription>{pulse.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-surface/80 p-3">
                  <div className="text-xs text-muted-foreground">Entradas realizadas</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{formatBRL(metrics.entradasRealizadas)}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/80 p-3">
                  <div className="text-xs text-muted-foreground">Saidas realizadas</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{formatBRL(metrics.saidasRealizadas)}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/80 p-3">
                  <div className="text-xs text-muted-foreground">Entradas previstas</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{formatBRL(metrics.entradasPrevistas)}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/80 p-3">
                  <div className="text-xs text-muted-foreground">Saidas previstas</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{formatBRL(metrics.saidasPrevistas)}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 sm:col-span-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Despesas / Receitas</span>
                    <span className="font-medium text-foreground">{metrics.despesasReceitasRatio.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-2 rounded-full',
                        metrics.despesasReceitasRatio > 90 ? 'bg-rose-500' : metrics.despesasReceitasRatio > 75 ? 'bg-amber-500' : 'bg-emerald-500',
                      )}
                      style={{ width: `${Math.min(100, metrics.despesasReceitasRatio)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="soft" className="border-border/60 bg-background/85 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.16)]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base font-semibold text-foreground">
                  <span>Meta ativa</span>
                  <Target className="h-4 w-4 text-primary" />
                </CardTitle>
                <CardDescription>
                  {activeGoal ? activeGoal.name : 'Nenhuma meta financeira ativa para este workspace'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeGoal ? (
                  <>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-2xl font-semibold text-foreground">{formatBRL(activeGoal.current_amount)}</div>
                        <div className="text-sm text-muted-foreground">de {formatBRL(activeGoal.target_amount)}</div>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-surface/80 px-3 py-2 text-right">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Gap</div>
                        <div className="text-base font-semibold text-foreground">{formatBRL(pulse.goalGap ?? 0)}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={Math.min(100, progress)} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{pulse.goalLabel}</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-surface/75 p-4 text-sm text-muted-foreground">
                    Quando a meta for configurada, ela aparece aqui com gap, ritmo e progresso.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <div
              key={item.label}
              className="min-h-[6.5rem] rounded-[1.25rem] border border-border/60 bg-background/78 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.16)]"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-xl font-semibold text-foreground">{formatBRL(item.value)}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.helper}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CircleAlert className="h-4 w-4 text-amber-500" />
          A leitura prioriza caixa, metas e alertas antes de qualquer grafico.
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveCommandCenter;
