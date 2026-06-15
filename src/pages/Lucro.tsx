import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Briefcase, Filter, LineChart } from 'lucide-react';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import LoadingSpinner from '@/components/LoadingSpinner';
import DateRangeFilter, { DateRangeState, PresetName } from '@/components/DateRangeFilter';
import { startOfYear, endOfMonth, startOfMonth } from 'date-fns';
import { useProfitLoss } from '@/hooks/useProfitLoss';
import DRETable from '@/components/lucro/DRETable';
import ProfitIndicators from '@/components/lucro/ProfitIndicators';

const Lucro = () => {
  const now = new Date();
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  
  const [dateRange, setDateRange] = useState<DateRangeState>({
    presetName: 'custom',
    startDate: startOfYear(now),
    endDate: endOfMonth(now)
  });

  const { transactions, categories, loading } = useSupabaseFinancialData();
  
  const { dreMetrics, loading: dreLoading } = useProfitLoss(
    transactions, 
    categories,
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

  if (loading || dreLoading) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => {}}
      >
        <LoadingSpinner text="Calculando DRE..." />
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LineChart className="h-4 w-4" />
              Resultado e margem
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              Demonstrativo de Resultado (DRE)
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Leitura executiva do resultado, com filtro temporal e foco em rentabilidade, estrutura e tendência.
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

        {/* Indicadores de Lucro */}
        <ProfitIndicators metrics={dreMetrics} />

        {/* Tabela DRE */}
        <DRETable metrics={dreMetrics} />
        
        {/* TODO: Adicionar Gráfico de Composição e Evolução */}
      </div>
    </Layout>
  );
};

export default Lucro;
