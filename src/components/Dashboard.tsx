
import React, { useCallback } from 'react';
import { Transaction, Category } from '@/types/financial';
import PeriodFilter, { PeriodType } from './PeriodFilter';
import MetricsGrid from './MetricsGrid';
import CashAlerts from './CashAlerts';
import RecurrenceInfo from './RecurrenceInfo';
import UpcomingTransactions from './UpcomingTransactions';
import DashboardCharts from './DashboardCharts';
import CategoryCharts from './CategoryCharts';

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
      {/* Header Mobile-First */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-foreground">
            {workspace === 'PF' ? 'Pessoal' : 'Empresa'}
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Visão geral das finanças
          </p>
        </div>
        
        <PeriodFilter
          selectedPeriod={periodFilter.type}
          customStartDate={periodFilter.startDate}
          customEndDate={periodFilter.endDate}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Alertas e Recorrências - Mobile First Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <CashAlerts transactions={transactions} workspace={workspace} />
        <RecurrenceInfo 
          transactions={transactions} 
          workspace={workspace} 
          onRefresh={onRefreshData || (() => {})}
          loading={loading}
        />
      </div>

      {/* Métricas Principais */}
      <MetricsGrid 
        transactions={transactions}
        workspace={workspace}
        startDate={periodFilter.startDate}
        endDate={periodFilter.endDate}
      />

      {/* Próximos Vencimentos */}
      <UpcomingTransactions transactions={transactions} workspace={workspace} />

      {/* Gráficos - Stack em Mobile */}
      <div className="space-y-4 lg:space-y-6">
        <DashboardCharts 
          metrics={{
            entradasPrevistas: 0,
            entradasRealizadas: 0,
            saidasPrevistas: 0,
            saidasPagas: 0,
            saldoProjetado: 0,
            saldoReal: 0
          }} 
          workspace={workspace} 
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
