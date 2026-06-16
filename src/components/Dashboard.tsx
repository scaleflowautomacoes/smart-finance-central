import React from 'react';
import { Transaction, Category, Goal } from '@/types/financial';
import DateRangeFilter, { DateRangeState, PresetName } from './DateRangeFilter';
import { MetricsGridUsingCentralMetrics } from './dashboard/MetricsGridUsingCentralMetrics';
import { FocusSection } from './dashboard/FocusSection';
import { AlertsSection } from './dashboard/AlertsSection';
import { ImprovedRecentTransactions } from './dashboard/ImprovedRecentTransactions';
import { ImprovedDashboardCharts } from './dashboard/ImprovedDashboardCharts';
import { ImprovedCategoryCharts } from './dashboard/ImprovedCategoryCharts';
import MonthlyTrendChart from './dashboard/MonthlyTrendChart';
import RecurringPatternsCard from './dashboard/RecurringPatternsCard';
import FinancialPeriodInsightsCard from './dashboard/FinancialPeriodInsightsCard';
import { Card, CardContent } from '@/components/ui/card';
import { useCentralMetrics } from '@/hooks/useCentralMetrics';
import ExecutiveCommandCenter from './dashboard/ExecutiveCommandCenter';

interface DashboardProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  categories: Category[];
  goals?: Goal[];
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
  goals,
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

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <ExecutiveCommandCenter
        workspace={workspace}
        transactions={transactions}
        metrics={metrics}
        goals={goals}
        dateRange={dateRange}
        onRefreshData={onRefreshData}
        onNewTransaction={onNewTransaction}
      />

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-9">
          <MetricsGridUsingCentralMetrics
            transactions={transactions}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>

        <Card variant="soft" className="xl:col-span-3 overflow-hidden">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Filtro atual</div>
              <div className="text-base font-semibold text-foreground">{monthLabel}</div>
              <p className="text-sm text-muted-foreground">
                Ajuste rápido do recorte temporal sem perder a leitura executiva.
              </p>
            </div>
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              presetName={dateRange.presetName}
              onRangeChange={onRangeChange}
              onClear={onClearFilter}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-12">
          <FinancialPeriodInsightsCard
            transactions={transactions}
            categories={categories}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <MonthlyTrendChart transactions={transactions} workspace={workspace} />
        </div>
        <div className="xl:col-span-5 space-y-5">
          <ImprovedDashboardCharts
            transactions={transactions}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <FocusSection
            transactions={transactions}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
        <div className="xl:col-span-7">
          <AlertsSection
            transactions={transactions}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-12">
          <RecurringPatternsCard
            transactions={transactions}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <ImprovedCategoryCharts
            transactions={transactions}
            categories={categories}
            workspace={workspace}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
        <div className="xl:col-span-4">
          <ImprovedRecentTransactions
            transactions={transactions}
            categories={categories}
            workspace={workspace}
          />
        </div>
      </section>
    </div>
  );
};

export default React.memo(Dashboard);
