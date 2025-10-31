import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { TrendingUp, Filter } from 'lucide-react';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import LoadingSpinner from '@/components/LoadingSpinner';
import DateRangeFilter, { DateRangeState, PresetName } from '@/components/DateRangeFilter';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import ComparativeMetrics from '@/components/relatorios/ComparativeMetrics';
import CategoryBreakdown from '@/components/relatorios/CategoryBreakdown';
import CashFlowArea from '@/components/relatorios/CashFlowArea';
import FinancialIndicators from '@/components/relatorios/FinancialIndicators';

const Relatorios = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  
  const [dateRange, setDateRange] = useState<DateRangeState>({
    presetName: 'este-mes',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });

  const { transactions, categories, loading } = useSupabaseFinancialData();
  
  const { metrics, loading: metricsLoading } = useReportMetrics(
    transactions, 
    currentWorkspace, 
    dateRange.startDate, 
    dateRange.endDate
  );

  const handleRangeChange = (start: Date, end: Date, presetName: PresetName) => {
    setDateRange({ startDate: start, endDate: end, presetName });
  };

  const handleClearFilter = () => {
    const now = new Date();
    setDateRange({
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
      presetName: 'este-mes'
    });
  };

  if (loading || metricsLoading) {
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
      <div className="p-4 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <TrendingUp className="h-7 w-7 text-primary" />
            <span>Relatórios Financeiros ({currentWorkspace})</span>
          </h1>
          
          <div className="flex items-center space-x-3">
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