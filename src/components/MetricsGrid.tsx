import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';

interface MetricsGridProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ 
  transactions, 
  workspace, 
  startDate, 
  endDate 
}) => {
  const metrics = useFinancialCalculations(transactions, workspace, startDate, endDate);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-success dark:text-green-400';
    if (value < 0) return 'text-error dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      {/* Entradas */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-green-900/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Entradas Realizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg lg:text-2xl font-bold text-green-800 dark:text-green-300">
            {formatCurrency(metrics.entradasRealizadas)}
          </div>
          <p className="text-xs text-green-600 dark:text-green-500">
            Prev: {formatCurrency(metrics.entradasPrevistas)}
          </p>
        </CardContent>
      </Card>

      {/* Saídas */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-red-900/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-red-700 dark:text-red-400 flex items-center">
            <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Saídas Realizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg lg:text-2xl font-bold text-red-800 dark:text-red-300">
            {formatCurrency(metrics.saidasRealizadas)}
          </div>
          <p className="text-xs text-red-600 dark:text-red-500">
            Prev: {formatCurrency(metrics.saidasPrevistas)}
          </p>
        </CardContent>
      </Card>

      {/* Saldo Real */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-blue-900/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center">
            <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Saldo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-lg lg:text-2xl font-bold ${getValueColor(metrics.saldoReal)}`}>
            {formatCurrency(metrics.saldoReal)}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-500">Confirmado</p>
        </CardContent>
      </Card>

      {/* Projetado */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-purple-900/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-purple-700 dark:text-purple-400 flex items-center">
            <Target className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Projetado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-lg lg:text-2xl font-bold ${getValueColor(metrics.saldoProjetado)}`}>
            {formatCurrency(metrics.saldoProjetado)}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-500">Com previsões</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsGrid;