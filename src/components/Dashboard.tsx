import React from 'react';
import { Transaction, Category } from '@/types/financial';
import DateRangeFilter, { DateRangeState, PresetName } from './DateRangeFilter';
import DashboardMetricsGrid from './DashboardMetricsGrid';
import DashboardRecentTransactions from './DashboardRecentTransactions';
import DashboardCharts from './DashboardCharts';
import CategoryCharts from './CategoryCharts';
import MonthlyTrendChart from './dashboard/MonthlyTrendChart';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
interface DashboardProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  categories: Category[];
  dateRange: DateRangeState;
  onRangeChange: (start: Date, end: Date, presetName: PresetName) => void;
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
  loading = false,
  onRefreshData,
  onNewTransaction
}) => {

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
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            presetName={dateRange.presetName}
            onRangeChange={onRangeChange}
            onClear={onClearFilter}
          />
          <Button 
            onClick={onNewTransaction} 
            className="w-full sm:w-auto h-10 px-6 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Métricas Principais (4 Colunas) */}
      <DashboardMetricsGrid 
        transactions={transactions}
        workspace={workspace}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      {/* Últimas Transações */}
      <DashboardRecentTransactions 
        transactions={transactions} 
        categories={categories} 
        workspace={workspace} 
      />

      {/* Gráfico de Tendências */}
      <MonthlyTrendChart 
        transactions={transactions}
        workspace={workspace}
      />

      {/* Gráficos */}
      <div className="space-y-4 lg:space-y-6">
        <DashboardCharts 
          transactions={transactions}
          workspace={workspace} 
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
        />
        
        <CategoryCharts 
          transactions={transactions} 
          categories={categories} 
          workspace={workspace} 
          dateRange={dateRange}
        />
      </div>
    </div>
  );
};

export default React.memo(Dashboard);