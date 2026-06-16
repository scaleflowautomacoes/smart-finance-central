import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarRange, PieChart, Rows4 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateRangeState } from '@/components/DateRangeFilter';
import { Goal, Transaction } from '@/types/financial';
import { FinancialMetricsCore } from '@/hooks/useFinancialMetricsCore';
import { buildOperationalWindowSummary, deriveFinancePulse, formatBRL, getActiveGoal } from '@/utils/financeNarrative';
import { cn } from '@/lib/utils';

interface ExecutiveReportStripProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  metrics: {
    current: FinancialMetricsCore;
    previous: FinancialMetricsCore;
    variation: { entradas: number; saidas: number; saldo: number };
  };
  goals?: Goal[];
  dateRange: DateRangeState;
}

const ExecutiveReportStrip: React.FC<ExecutiveReportStripProps> = ({ workspace, transactions, metrics, goals, dateRange }) => {
  const activeGoal = useMemo(() => getActiveGoal(goals, workspace), [goals, workspace]);
  const windowSummary = useMemo(() => buildOperationalWindowSummary(transactions, workspace, dateRange.startDate, dateRange.endDate), [transactions, workspace, dateRange.startDate, dateRange.endDate]);
  const pulse = useMemo(() => deriveFinancePulse(metrics.current, activeGoal, windowSummary), [metrics, activeGoal, windowSummary]);

  const directionClass = (value: number) => value >= 0 ? 'text-emerald-300' : 'text-rose-300';

  return (
    <Card variant="solid" className="overflow-hidden border-border/40 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.95)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(194_84%_50%/0.12),transparent_28%)]" />
      <CardContent className="relative p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch xl:justify-between">
          <div className="max-w-4xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 text-white/90">
                <BarChart3 className="mr-2 h-3.5 w-3.5" />
                Relatórios executivos
              </Badge>
              <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 text-white/80">
                <CalendarRange className="mr-2 h-3.5 w-3.5" />
                {dateRange.presetName === 'tudo' ? 'Histórico completo' : 'Período filtrado'}
              </Badge>
              <Badge variant="outline" className={cn('rounded-full', pulse.status === 'critical' ? 'border-rose-400/30 bg-rose-500/10 text-rose-200' : pulse.status === 'attention' ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200')}>
                {pulse.title}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              Leitura analítica do caixa, categorias e resultado por período
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-white/70 lg:text-base">
              A aba de relatórios deixa de ser satélite e passa a servir o gestor: comparação temporal, concentração por categoria, alertas de janela e leitura de resultado por workspace.
            </p>
          </div>

          <div className="grid min-w-[18rem] gap-3 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/55">Resultado projetado</div>
              <div className={`mt-2 text-2xl font-semibold ${directionClass(metrics.current.saldoProjetado)}`}>{formatBRL(metrics.current.saldoProjetado)}</div>
              <div className="mt-1 text-sm text-white/60">Agora vs. previsto no período</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/55">Categoria líder</div>
              <div className="mt-2 text-2xl font-semibold text-white">{activeGoal ? activeGoal.name : 'Sem meta ativa'}</div>
              <div className="mt-1 text-sm text-white/60">{activeGoal ? `${formatBRL(activeGoal.current_amount)} de ${formatBRL(activeGoal.target_amount)}` : 'Configurar meta financeira ajuda o acompanhamento'}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/55">
              <span>Fluxo total</span><Rows4 className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{formatBRL(metrics.current.totalEntradas + metrics.current.totalSaidas)}</div>
            <div className="mt-1 text-sm text-white/60">Entradas + saídas do recorte</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/55">
              <span>Entradas</span><ArrowUpRight className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{formatBRL(metrics.current.totalEntradas)}</div>
            <div className="mt-1 text-sm text-white/60">{metrics.variation.entradas >= 0 ? '+' : ''}{metrics.variation.entradas.toFixed(1)}% vs. período anterior</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/55">
              <span>Saídas</span><ArrowDownRight className="h-4 w-4 text-rose-300" />
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{formatBRL(metrics.current.totalSaidas)}</div>
            <div className="mt-1 text-sm text-white/60">{metrics.variation.saidas >= 0 ? '+' : ''}{metrics.variation.saidas.toFixed(1)}% vs. período anterior</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/55">
              <span>Consolidação</span><PieChart className="h-4 w-4 text-violet-300" />
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{metrics.current.despesasReceitasRatio.toFixed(1)}%</div>
            <div className="mt-1 text-sm text-white/60">Despesa sobre receita</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveReportStrip;
