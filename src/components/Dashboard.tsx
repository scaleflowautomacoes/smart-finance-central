import React, { useCallback } from 'react';
import { Transaction, Category } from '@/types/financial';
import PeriodFilter, { PeriodType } from './PeriodFilter';
import DashboardMetricsGrid from './DashboardMetricsGrid';
import DashboardRecentTransactions from './DashboardRecentTransactions';
import DashboardCharts from './DashboardCharts';
import CategoryCharts from './CategoryCharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 lg:space-y-6">
      {/* Header e Filtros (Layout do Screenshot) */}
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

      {/* Métricas Principais (4 Colunas) */}
      {periodFilter.startDate && periodFilter.endDate && (
        <DashboardMetricsGrid 
          transactions={transactions}
          workspace={workspace}
          startDate={periodFilter.startDate}
          endDate={periodFilter.endDate}
        />
      )}

      {/* Últimas Transações */}
      <DashboardRecentTransactions 
        transactions={transactions} 
        categories={categories} 
        workspace={workspace} 
      />

      {/* Gráficos */}
      <div className="space-y-4 lg:space-y-6">
        <DashboardCharts 
          transactions={transactions}
          workspace={workspace} 
          startDate={periodFilter.startDate}
          endDate={periodFilter.endDate}
        />
        
        <CategoryCharts 
          transactions={transactions} 
          categories={categories} 
          workspace={workspace} 
          periodFilter={periodFilter}
        />
      </div>
    </div>
  );
};

export default React.memo(Dashboard);