
import React, { useMemo, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardMetrics } from '@/types/financial';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const calculatedMetrics = useMemo(() => {
    const saldoConfirmado = metrics.entradasRealizadas - metrics.saidasPagas;
    const saldoProjetado = (metrics.entradasPrevistas + metrics.entradasRealizadas) - (metrics.saidasPrevistas + metrics.saidasPagas);
    
    const getPercentageChange = (realized: number, projected: number) => {
      if (projected === 0) return 0;
      return ((realized / projected) * 100).toFixed(1);
    };

    return {
      saldoConfirmado,
      saldoProjetado,
      entradaPercentage: getPercentageChange(metrics.entradasRealizadas, metrics.entradasPrevistas),
      saidaPercentage: getPercentageChange(metrics.saidasPagas, metrics.saidasPrevistas),
      realizationRate: metrics.entradasPrevistas > 0 
        ? ((metrics.entradasRealizadas / (metrics.entradasRealizadas + metrics.entradasPrevistas)) * 100).toFixed(1)
        : '100',
      paymentRate: metrics.saidasPrevistas > 0 
        ? ((metrics.saidasPagas / (metrics.saidasPagas + metrics.saidasPrevistas)) * 100).toFixed(1)
        : '100'
    };
  }, [metrics]);
  
  const getStatusColor = useCallback((value: number) => {
    if (value > 0) return CHART_COLORS.income.main;
    if (value < 0) return CHART_COLORS.expense.main;
    return CHART_COLORS.neutral[600];
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Entradas Realizadas
          </CardTitle>
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-md">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700 mb-2">
            {formatCurrency(metrics.entradasRealizadas)}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Previstas: {formatCurrency(metrics.entradasPrevistas)}
            </div>
            {metrics.entradasPrevistas > 0 && (
              <div className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                {calculatedMetrics.entradaPercentage}% realizado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Saídas Pagas
          </CardTitle>
          <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-md">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-700 mb-2">
            {formatCurrency(metrics.saidasPagas)}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Previstas: {formatCurrency(metrics.saidasPrevistas)}
            </div>
            {metrics.saidasPrevistas > 0 && (
              <div className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                {calculatedMetrics.saidaPercentage}% pago
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Saldo Confirmado
          </CardTitle>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-md">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="text-3xl font-bold mb-2"
            style={{ color: getStatusColor(calculatedMetrics.saldoConfirmado) }}
          >
            {formatCurrency(calculatedMetrics.saldoConfirmado)}
          </div>
          <p className="text-xs text-gray-600">
            Apenas valores confirmados
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Saldo Projetado
          </CardTitle>
          <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full shadow-md">
            <Target className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="text-3xl font-bold mb-2"
            style={{ color: getStatusColor(calculatedMetrics.saldoProjetado) }}
          >
            {formatCurrency(calculatedMetrics.saldoProjetado)}
          </div>
          <p className="text-xs text-gray-600">
            Incluindo previsões
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(MetricsCards);
