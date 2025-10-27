import React, { useCallback } from 'react';
import { Transaction, Category } from '@/types/financial';
import PeriodFilter, { PeriodType } from './PeriodFilter';
import DashboardMetricsGrid from './DashboardMetricsGrid';
import DashboardRecentTransactions from './DashboardRecentTransactions';
import DashboardCharts from './DashboardCharts';
import CategoryCharts from './CategoryCharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingSpinner from './LoadingSpinner';

interface DashboardProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  categories: Category[];
  onPeriodChange: (period: PeriodType, startDate?: Date, endDate?: Date) => void;
  periodFilter: {
    type: PeriodType;
    startDate?: Date;
    endDate?: Date;
  };
  loading?: boolean;
  onRefreshData?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  workspace, 
  transactions,
  categories,
  onPeriodChange,
  periodFilter,
  loading = false,
  onRefreshData
}) => {
  const handlePeriodChange = useCallback((period: PeriodType, startDate?: Date, endDate?: Date) => {
    onPeriodChange(period, startDate, endDate);
  }, [onPeriodChange]);

  const periodLabel = periodFilter.startDate && periodFilter.endDate 
    ? `${format(periodFilter.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(periodFilter.endDate, 'dd/MM/yyyy', { locale: ptBR })}`
    : 'Período Atual';

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <LoadingSpinner text="Carregando Dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 lg:space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-foreground">
            Dashboard {workspace === 'PF' ? 'Pessoal' : 'Empresarial'}
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Visão geral das suas finanças {workspace === 'PF' ? 'pessoal' : 'empresarial'}
          </p>
        </div>
        
        <PeriodFilter
          selectedPeriod={periodFilter.type}
          customStartDate={periodFilter.startDate}
          customEndDate={periodFilter.endDate}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* 1. Métricas Principais (4 Colunas) */}
      {periodFilter.startDate && periodFilter.endDate && (
        <DashboardMetricsGrid 
          transactions={transactions}
          workspace={workspace}
          startDate={periodFilter.startDate}
          endDate={periodFilter.endDate}
        />
      )}

      {/* 2. Gráficos (Distribuição e Previsto vs Realizado) */}
      <DashboardCharts 
        transactions={transactions}
        workspace={workspace} 
        startDate={periodFilter.startDate}
        endDate={periodFilter.endDate}
      />
      
      {/* 3. Gráficos de Categoria (Entradas/Saídas) */}
      <CategoryCharts 
        transactions={transactions} 
        categories={categories} 
        workspace={workspace} 
        periodFilter={periodFilter}
      />

      {/* 4. Últimas Transações */}
      <DashboardRecentTransactions 
        transactions={transactions} 
        categories={categories} 
        workspace={workspace} 
      />
    </div>
  );
};

export default React.memo(Dashboard);