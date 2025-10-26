
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { Transaction } from '@/types/financial';

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
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-green-700 flex items-center">
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Entradas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg lg:text-2xl font-bold text-green-800">
            {formatCurrency(metrics.entradasRealizadas)}
          </div>
          <p className="text-xs text-green-600">
            Prev: {formatCurrency(metrics.entradasPrevistas)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-red-700 flex items-center">
            <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Saídas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg lg:text-2xl font-bold text-red-800">
            {formatCurrency(metrics.saidasRealizadas)}
          </div>
          <p className="text-xs text-red-600">
            Prev: {formatCurrency(metrics.saidasPrevistas)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-blue-700 flex items-center">
            <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Saldo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-lg lg:text-2xl font-bold ${getValueColor(metrics.saldoReal)}`}>
            {formatCurrency(metrics.saldoReal)}
          </div>
          <p className="text-xs text-blue-600">Confirmado</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium text-purple-700 flex items-center">
            <Target className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Projetado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-lg lg:text-2xl font-bold ${getValueColor(metrics.saldoProjetado)}`}>
            {formatCurrency(metrics.saldoProjetado)}
          </div>
          <p className="text-xs text-purple-600">Com previsões</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsGrid;
