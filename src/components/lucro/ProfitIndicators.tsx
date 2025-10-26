import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, Zap } from 'lucide-react';
import { DREMetrics } from '@/hooks/useProfitLoss';

interface ProfitIndicatorsProps {
  metrics: DREMetrics;
}

const ProfitIndicators: React.FC<ProfitIndicatorsProps> = ({ metrics }) => {
  const getStatusColor = (value: number) => {
    if (value > 10) return 'text-green-600';
    if (value > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Margem Bruta */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <Percent className="h-4 w-4 text-blue-600" />
            Margem Bruta (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getStatusColor(metrics.margemBrutaPercent)}`}>
            {metrics.margemBrutaPercent.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Receita Líquida / Receita Bruta
          </p>
        </CardContent>
      </Card>

      {/* Margem Líquida */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            Margem Líquida (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getStatusColor(metrics.margemLiquidaPercent)}`}>
            {metrics.margemLiquidaPercent.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lucro Líquido / Receita Bruta
          </p>
        </CardContent>
      </Card>

      {/* EBITDA */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <Zap className="h-4 w-4 text-purple-600" />
            EBITDA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${metrics.ebitda >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.ebitda)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lucro operacional antes de juros, impostos, depreciação e amortização.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitIndicators;