import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleAlert, CircleCheckBig, Target, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
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
  healthy: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  opportunity: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  attention: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  critical: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
} as const;

const statusIcons = {
  healthy: CircleCheckBig,
  opportunity: Sparkles,
  attention: CircleAlert,
  critical: ShieldAlert,
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
  const windowSummary = useMemo(() => buildOperationalWindowSummary(transactions, workspace, dateRange.startDate, dateRange.endDate), [transactions, workspace, dateRange.startDate, dateRange.endDate]);
  const pulse = useMemo(() => deriveFinancePulse(metrics, activeGoal, windowSummary), [metrics, activeGoal, windowSummary]);
  const PulseIcon = statusIcons[pulse.status];

  const progress = pulse.goalProgress ?? 0;
  const cashCommitted = windowSummary.pendingPayments + windowSummary.overduePayments;
  const monthLabel = dateRange.presetName === 'tudo'
    ? 'Todo o histórico'
    : dateRange.startDate && dateRange.endDate
      ? `${dateRange.startDate.toLocaleDateString('pt-BR')} → ${dateRange.endDate.toLocaleDateString('pt-BR')}`
      : 'Período ativo';

  return (
    <Card variant="solid" className="relative overflow-hidden border-border/40 bg-surface-strong text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.95)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.20),transparent_30%),radial-gradient(circle_at_bottom_left,hsl(194_84%_50%/0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_30%)]" />
      <CardContent className="relative p-5 lg:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-white/90">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Command center financeiro
              </Badge>
              <Badge variant="outline" className={cn('rounded-full px-3 py-1', statusStyles[pulse.status])}>
                <PulseIcon className="mr-2 h-3.5 w-3.5" />
                {pulse.title}
              </Badge>
              <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-white/80">
                {workspace === 'PF' ? 'PF' : 'PJ'}
              </Badge>
              <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-white/80">
                {monthLabel}
              </Badge>
            </div>

            <div className="max-w-4xl space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/65">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Janelas operacionais: 05-15 recebimentos / 25-30 pagamentos
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Meta e histórico como base, sem achismo
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-5xl">
                {workspace === 'PJ' ? 'PJ em foco.' : 'PF em foco.'} Caixa, metas e risco em uma única leitura.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/72 lg:text-base">
                O painel responde primeiro ao que importa hoje: quanto entrou, quanto falta entrar, quanto está comprometido, onde mora o risco e qual é o desvio frente à meta.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/60">
                  <span>Saldo atual</span>
                  <ArrowUpRight className={`h-4 w-4 ${metrics.saldoReal >= 0 ? 'text-emerald-300' : 'text-rose-300'}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{formatBRL(metrics.saldoReal)}</div>
                <p className="mt-1 text-sm text-white/55">Somente realizado e confirmado</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/60">
                  <span>Saldo projetado</span>
                  <ArrowUpRight className={`h-4 w-4 ${metrics.saldoProjetado >= 0 ? 'text-cyan-300' : 'text-rose-300'}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{formatBRL(metrics.saldoProjetado)}</div>
                <p className="mt-1 text-sm text-white/55">Realizado + previsto</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/60">
                  <span>Caixa livre</span>
                  <ArrowDownRight className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="mt-2 text-2xl font-semibold">{formatBRL(pulse.cashFree)}</div>
                <p className="mt-1 text-sm text-white/55">Após compromissos previstos</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/60">
                  <span>Caixa comprometido</span>
                  <ArrowDownRight className="h-4 w-4 text-amber-300" />
                </div>
                <div className="mt-2 text-2xl font-semibold">{formatBRL(cashCommitted)}</div>
                <p className="mt-1 text-sm text-white/55">Saídas pendentes + vencidas</p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 xl:w-[22rem] xl:min-w-[22rem]">
            <Card className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg text-white">
                  <span>Status do mês</span>
                  <Badge variant="outline" className={cn('rounded-full border-white/10', statusStyles[pulse.status])}>
                    {pulse.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/65">{pulse.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <div className="text-white/55">Entradas realizadas</div>
                    <div className="mt-1 text-lg font-semibold">{formatBRL(metrics.entradasRealizadas)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <div className="text-white/55">Entradas previstas</div>
                    <div className="mt-1 text-lg font-semibold">{formatBRL(metrics.entradasPrevistas)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <div className="text-white/55">Saídas realizadas</div>
                    <div className="mt-1 text-lg font-semibold">{formatBRL(metrics.saidasRealizadas)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <div className="text-white/55">Saídas previstas</div>
                    <div className="mt-1 text-lg font-semibold">{formatBRL(metrics.saidasPrevistas)}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="flex items-center justify-between text-sm text-white/65">
                    <span>Despesas / Receitas</span>
                    <span>{metrics.despesasReceitasRatio.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className={cn('h-2 rounded-full', metrics.despesasReceitasRatio > 90 ? 'bg-rose-400' : metrics.despesasReceitasRatio > 75 ? 'bg-amber-400' : 'bg-emerald-400')} style={{ width: `${Math.min(100, metrics.despesasReceitasRatio)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg text-white">
                  <span>Meta ativa</span>
                  <Target className="h-4 w-4 text-cyan-300" />
                </CardTitle>
                <CardDescription className="text-white/65">{activeGoal ? activeGoal.name : 'Nenhuma meta financeira ativa para este workspace'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeGoal ? (
                  <>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-3xl font-semibold text-white">{formatBRL(activeGoal.current_amount)}</div>
                        <div className="text-sm text-white/60">de {formatBRL(activeGoal.target_amount)}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-2 text-right">
                        <div className="text-xs uppercase tracking-[0.24em] text-white/50">Gap</div>
                        <div className="text-lg font-semibold">{formatBRL(pulse.goalGap ?? 0)}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={Math.min(100, progress)} className="h-2 bg-white/10" />
                      <div className="flex items-center justify-between text-sm text-white/65">
                        <span>{pulse.goalLabel}</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-4 text-sm text-white/70">
                    Quando a meta for configurada, ela aparece aqui com gap, ritmo e progresso.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">Recebimentos pendentes</div>
            <div className="mt-2 text-xl font-semibold">{formatBRL(windowSummary.pendingReceipts)}</div>
            <div className="mt-1 text-sm text-white/60">{formatBRL(windowSummary.next15Receipts)} nos próximos 15 dias</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">Pagamentos pendentes</div>
            <div className="mt-2 text-xl font-semibold">{formatBRL(windowSummary.pendingPayments)}</div>
            <div className="mt-1 text-sm text-white/60">{formatBRL(windowSummary.next30Payments)} nos próximos 30 dias</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">Recebimentos vencidos</div>
            <div className="mt-2 text-xl font-semibold">{formatBRL(windowSummary.overdueReceipts)}</div>
            <div className="mt-1 text-sm text-white/60">Itens que já merecem cobrança</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">Pagamentos vencidos</div>
            <div className="mt-2 text-xl font-semibold">{formatBRL(windowSummary.overduePayments)}</div>
            <div className="mt-1 text-sm text-white/60">Saídas que pressionam a projeção</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-white/65">
            <CircleAlert className="h-4 w-4 text-amber-300" />
            A leitura prioriza caixa, metas e alertas antes de qualquer gráfico
          </div>
          <div className="flex flex-wrap gap-2">
            {onRefreshData && (
              <Button variant="outline" onClick={onRefreshData} className="rounded-xl border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                Atualizar dados
              </Button>
            )}
            <Button onClick={onNewTransaction} className="rounded-xl bg-white text-slate-950 hover:bg-slate-100">
              Nova transação
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveCommandCenter;
