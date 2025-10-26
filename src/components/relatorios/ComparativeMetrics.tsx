import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import { formatCurrency } from '@/utils/chartColors';

interface ComparativeMetricsProps {
  metrics: ReturnType<typeof useReportMetrics>['metrics'];
}

const ComparativeMetrics: React.FC<ComparativeMetricsProps> = ({ metrics }) => {
  const { current, variation } = metrics;

  const getVariationDisplay = (value: number, isPositiveGood: boolean) => {
    const color = value > 0 
      ? (isPositiveGood ? 'text-green-600' : 'text-red-600')
      : (value < 0 
        ? (isPositiveGood ? 'text-red-600' : 'text-green-600')
        : 'text-gray-500');
    
    const icon = value > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    
    return (
      <div className={`flex items-center space-x-1 text-sm font-medium ${color}`}>
        {icon}
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Entradas Totais */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Entradas Totais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700 mb-1">
            {formatCurrency(current.totalEntradas)}
          </div>
          {getVariationDisplay(variation.entradas, true)}
          <p className="text-xs text-muted-foreground mt-1">vs. período anterior</p>
        </CardContent>
      </Card>

      {/* Saídas Totais */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Saídas Totais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-700 mb-1">
            {formatCurrency(current.totalSaidas)}
          </div>
          {getVariationDisplay(variation.saidas, false)}
          <p className="text-xs text-muted-foreground mt-1">vs. período anterior</p>
        </CardContent>
      </Card>

      {/* Saldo Projetado */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Saldo Projetado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold mb-1 ${current.saldoProjetado >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(current.saldoProjetado)}
          </div>
          {getVariationDisplay(variation.saldo, true)}
          <p className="text-xs text-muted-foreground mt-1">vs. período anterior</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparativeMetrics;