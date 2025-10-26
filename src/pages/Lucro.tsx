import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Briefcase, Filter } from 'lucide-react';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import LoadingSpinner from '@/components/LoadingSpinner';
import PeriodFilter, { PeriodType } from '@/components/PeriodFilter';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useProfitLoss } from '@/hooks/useProfitLoss';
import DRETable from '@/components/lucro/DRETable';
import ProfitIndicators from '@/components/lucro/ProfitIndicators';

const Lucro = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  
  const [periodFilter, setPeriodFilter] = useState<{
    type: PeriodType;
    startDate: Date;
    endDate: Date;
  }>({
    type: 'current',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });

  const { transactions, categories, loading } = useSupabaseFinancialData();
  
  const { dreMetrics, loading: dreLoading } = useProfitLoss(
    transactions, 
    categories,
    currentWorkspace, 
    periodFilter.startDate, 
    periodFilter.endDate
  );

  const handlePeriodChange = (period: PeriodType, startDate?: Date, endDate?: Date) => {
    if (startDate && endDate) {
      setPeriodFilter({
        type: period,
        startDate,
        endDate
      });
    }
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
      <div className="p-4 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Briefcase className="h-7 w-7 text-primary" />
            <span>Demonstrativo de Resultado (DRE) ({currentWorkspace})</span>
          </h1>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <PeriodFilter
              selectedPeriod={periodFilter.type}
              customStartDate={periodFilter.startDate}
              customEndDate={periodFilter.endDate}
              onPeriodChange={handlePeriodChange}
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