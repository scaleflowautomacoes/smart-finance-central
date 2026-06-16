import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Filter, Layers3 } from 'lucide-react';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import { useGoals } from '@/hooks/useGoals';
import LoadingSpinner from '@/components/LoadingSpinner';
import DateRangeFilter, { DateRangeState, PresetName } from '@/components/DateRangeFilter';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import ComparativeMetrics from '@/components/relatorios/ComparativeMetrics';
import CategoryBreakdown from '@/components/relatorios/CategoryBreakdown';
import CashFlowArea from '@/components/relatorios/CashFlowArea';
import FinancialIndicators from '@/components/relatorios/FinancialIndicators';
import ExecutiveReportStrip from '@/components/relatorios/ExecutiveReportStrip';

const Relatorios = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  
  const [dateRange, setDateRange] = useState<DateRangeState>({
    presetName: 'este-mes',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });

  const { transactions, categories, loading } = useSupabaseFinancialData();
  const { goals, loading: goalsLoading } = useGoals();
  
  const { metrics, loading: metricsLoading } = useReportMetrics(
    transactions, 
    currentWorkspace, 
    dateRange.startDate, 
    dateRange.endDate
  );

  const handleRangeChange = (start: Date | undefined, end: Date | undefined, presetName: PresetName) => {
    setDateRange({ startDate: start, endDate: end, presetName });
  };

  const handleClearFilter = () => {
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      presetName: 'tudo'
    });
  };

  if (loading || metricsLoading || goalsLoading) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => {}}
      >
        <LoadingSpinner text="Gerando relatórios..." />
      </Layout>
    );
  }

  return (
    <Layout
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={setCurrentWorkspace}
      onNewTransaction={() => {}}
    >
      <div className="space-y-6 p-4 lg:p-6">
        <ExecutiveReportStrip
          workspace={currentWorkspace}
          transactions={transactions}
          metrics={metrics}
          goals={goals.filter((goal) => goal.workspace === currentWorkspace)}
          dateRange={dateRange}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers3 className="h-4 w-4" />
              BI financeiro
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              Relatórios Financeiros
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Consolidação visual dos principais sinais do período, com comparativo temporal e leitura por categoria.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              presetName={dateRange.presetName}
              onRangeChange={handleRangeChange}
              onClear={handleClearFilter}
            />
          </div>
        </div>

        {/* 1. Comparativo Temporal */}
        <ComparativeMetrics metrics={metrics} />

        {/* 2. Indicadores Financeiros */}
        <FinancialIndicators metrics={metrics.current} />

        {/* 3. Fluxo de Caixa Visualizado (Gráfico de Área) */}
        <CashFlowArea 
          transactions={transactions} 
          workspace={currentWorkspace} 
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
        />

        {/* 4. Categorização Detalhada */}
        <CategoryBreakdown
          transactions={transactions}
          categories={categories}
          workspace={currentWorkspace}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
        />
      </div>
    </Layout>
  );
};

export default Relatorios;
