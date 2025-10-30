import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, Info, CheckCircle } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { formatCurrency } from '@/utils/chartColors';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/financial'; // Adicionado

interface DashboardMetricsGridProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate: Date;
  endDate: Date;
}

const getVariationDisplay = (value: number, isPositiveGood: boolean) => {
  const colorClass = value > 0 
    ? (isPositiveGood ? 'text-success' : 'text-error')
    : (value < 0 
      ? (isPositiveGood ? 'text-error' : 'text-success')
      : 'text-muted-foreground');
  
  const icon = value > 0 ? TrendingUp : TrendingDown;
  
  return (
    <div className={`flex items-center text-xs font-medium ${colorClass}`}>
      {Math.abs(value).toFixed(1)}%
      {value !== 0 && <span className="ml-1">{React.createElement(icon, { className: "h-3 w-3" })}</span>}
    </div>
  );
};

const DashboardMetricsGrid: React.FC<DashboardMetricsGridProps> = ({ 
  transactions, 
  workspace, 
  startDate, 
  endDate 
}) => {
  const { metrics } = useDashboardMetrics(transactions, workspace, startDate, endDate);

  const getHealthBadgeVariant = (score: typeof metrics.healthScore): "default" | "secondary" | "destructive" | "outline" => {
    switch (score) {
      case 'Excelente':
      case 'Bom':
        return 'default';
      case 'Regular':
        return 'secondary';
      case 'Ruim':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Receitas do Período */}
      <Card className="border-l-4 border-l-success dark:border-l-green-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas do período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success dark:text-green-400">
            {formatCurrency(metrics.receitasPeriodo)}
          </div>
          {getVariationDisplay(metrics.receitasVariation, true)}
        </CardContent>
      </Card>

      {/* 2. Despesas do Período */}
      <Card className="border-l-4 border-l-error dark:border-l-red-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas do período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-error dark:text-red-400">
            {formatCurrency(metrics.despesasPeriodo)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pendente: {formatCurrency(metrics.despesasPendentes)}
          </p>
        </CardContent>
      </Card>

      {/* 3. Saldo do Período */}
      <Card className="border-l-4 border-l-primary dark:border-l-blue-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo do período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.saldoPeriodo >= 0 ? 'text-primary dark:text-blue-400' : 'text-error dark:text-red-400'}`}>
            {formatCurrency(metrics.saldoPeriodo)}
          </div>
          {getVariationDisplay(metrics.saldoVariation, true)}
        </CardContent>
      </Card>

      {/* 4. Despesas/Receitas Ratio */}
      <Card className="border-l-4 border-l-warning dark:border-l-yellow-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas/Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning dark:text-yellow-400">
            {metrics.despesasReceitasRatio.toFixed(1)}%
          </div>
          <Badge variant={getHealthBadgeVariant(metrics.healthScore)} className="mt-1 flex items-center space-x-1">
            {metrics.healthScore === 'Excelente' || metrics.healthScore === 'Bom' ? <CheckCircle className="h-3 w-3" /> : <Info className="h-3 w-3" />}
            <span>Saúde Financeira: {metrics.healthScore}</span>
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetricsGrid;