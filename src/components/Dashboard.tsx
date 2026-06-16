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
