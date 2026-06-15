import React from 'react';
import { Transaction, Category } from '@/types/financial';
import DateRangeFilter, { DateRangeState, PresetName } from './DateRangeFilter';
import { MetricsGridUsingCentralMetrics } from './dashboard/MetricsGridUsingCentralMetrics';
import { FocusSection } from './dashboard/FocusSection';
import { AlertsSection } from './dashboard/AlertsSection';
import { ImprovedRecentTransactions } from './dashboard/ImprovedRecentTransactions';
import { ImprovedDashboardCharts } from './dashboard/ImprovedDashboardCharts';
import { ImprovedCategoryCharts } from './dashboard/ImprovedCategoryCharts';
import MonthlyTrendChart from './dashboard/MonthlyTrendChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, RefreshCw, Wallet, ArrowUpRight, ArrowDownRight, TriangleAlert, Sparkles } from 'lucide-react';
import { useCentralMetrics } from '@/hooks/useCentralMetrics';
import { formatCurrency } from '@/utils/chartColors';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  categories: Category[];
  dateRange: DateRangeState;
  onRangeChange: (start: Date | undefined, end: Date | undefined, presetName: PresetName) => void;
  onClearFilter: () => void;
  loading?: boolean;
  onRefreshData?: () => void;
  onNewTransaction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  workspace,
  transactions,
  categories,
  dateRange,
  onRangeChange,
  onClearFilter,
  onRefreshData,
  onNewTransaction,
}) => {
  const { metrics } = useCentralMetrics({
    transactions,
    workspace,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const monthLabel = dateRange.presetName === 'tudo'
    ? 'Tudo'
    : dateRange.startDate && dateRange.endDate
      ? `${dateRange.startDate.toLocaleDateString('pt-BR')} → ${dateRange.endDate.toLocaleDateString('pt-BR')}`
      : 'Período ativo';

  const hasNegativeBalance = metrics.saldoProjetado < 0;
  const focusLabel = metrics.entradasVencidas > 0
    ? 'Cobrar recebimentos vencidos'
    : metrics.saidasVencidas > 0
      ? 'Priorizar pagamentos vencidos'
      : hasNegativeBalance
        ? 'Revisar projeção de caixa'
        : 'Caixa sob controle';

  const focusDescription = metrics.entradasVencidas > 0
    ? `${formatCurrency(metrics.entradasVencidas)} em entradas vencidas precisam de ação hoje.`
    : metrics.saidasVencidas > 0
      ? `${formatCurrency(metrics.saidasVencidas)} em saídas vencidas precisam de atenção imediata.`
      : hasNegativeBalance
        ? 'A projeção atual pede revisão de despesas e entradas futuras.'
        : 'Sem alertas críticos no momento. O caixa segue saudável.';

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <Card variant="glass" className="overflow-hidden border-border/60">
        <CardContent className="p-5 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1 rounded-full border-border/70 bg-surface/80 px-3 py-1">
                  <Wallet className="h-3.5 w-3.5" />
                  {workspace === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {monthLabel}
                </Badge>
                <Badge variant="outline" className="rounded-full border-success/20 bg-success/10 px-3 py-1 text-success">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Command center
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
                  Central de comando financeiro
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground lg:text-base">
                  Leitura diária do caixa com hierarquia visual forte, ações rápidas e foco em decisões sem ruído.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Foco do dia</span>
                    <TriangleAlert className="h-4 w-4 text-warning" />
                  </div>
                  <div className="mt-2 text-base font-semibold text-foreground">{focusLabel}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{focusDescription}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Saldo projetado</span>
                    <ArrowUpRight className={`h-4 w-4 ${metrics.saldoProjetado >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                  </div>
                  <div className={`mt-2 text-2xl font-semibold ${metrics.saldoProjetado >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {formatCurrency(metrics.saldoProjetado)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Entradas previstas menos saídas previstas</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>A receber</span>
                    <ArrowUpRight className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-sky-500">
                    {formatCurrency(metrics.entradasPrevistas)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Pendências de entrada no período</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>A pagar</span>
                    <ArrowDownRight className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-amber-500">
                    {formatCurrency(metrics.saidasPrevistas)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Pendências de saída no período</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
              {onRefreshData && (
                <Button variant="outline" onClick={onRefreshData} className="h-11 rounded-xl bg-background/80">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              )}
              <Button onClick={onNewTransaction} className="h-11 rounded-xl shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Nova transação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <MetricsGridUsingCentralMetrics
        transactions={transactions}
        workspace={workspace}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <FocusSection
          transactions={transactions}
          workspace={workspace}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
        />
        <AlertsSection
          transactions={transactions}
          workspace={workspace}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <MonthlyTrendChart transactions={transactions} workspace={workspace} />
        <div className="space-y-5">
          <ImprovedDashboardCharts
            transactions={transactions}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <Card variant="soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Filtro atual</div>
                  <div className="text-sm text-foreground">{monthLabel}</div>
                </div>
                <DateRangeFilter
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  presetName={dateRange.presetName}
                  onRangeChange={onRangeChange}
                  onClear={onClearFilter}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ImprovedCategoryCharts
        transactions={transactions}
        categories={categories}
        workspace={workspace}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      <ImprovedRecentTransactions
        transactions={transactions}
        categories={categories}
        workspace={workspace}
      />
    </div>
  );
};

export default React.memo(Dashboard);
