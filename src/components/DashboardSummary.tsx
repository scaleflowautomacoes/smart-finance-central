
import React, { useMemo, useCallback } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardMetrics } from '@/types/financial';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';

interface DashboardSummaryProps {
  metrics: DashboardMetrics;
  workspace: 'PF' | 'PJ';
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ metrics, workspace }) => {
  const calculatedMetrics = useMemo(() => {
    const saldoConfirmado = metrics.entradasRealizadas - metrics.saidasPagas;
    const saldoProjetado = (metrics.entradasPrevistas + metrics.entradasRealizadas) - (metrics.saidasPrevistas + metrics.saidasPagas);
    
    return {
      saldoConfirmado,
      saldoProjetado,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-gray-900">Resumo do Período</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-green-700 font-semibold">Total de Entradas</div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(metrics.entradasRealizadas + metrics.entradasPrevistas)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-red-700 font-semibold">Total de Saídas</div>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-800">
                {formatCurrency(metrics.saidasPagas + metrics.saidasPrevistas)}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
              <span className="font-semibold text-gray-900 text-lg">Resultado Projetado:</span>
              <span 
                className="text-2xl font-bold"
                style={{ color: getStatusColor(calculatedMetrics.saldoProjetado) }}
              >
                {formatCurrency(calculatedMetrics.saldoProjetado)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-lg text-gray-900">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Taxa de Realização (Entradas)</span>
                <span className="font-bold text-green-600">{calculatedMetrics.realizationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${calculatedMetrics.realizationRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Taxa de Pagamento (Saídas)</span>
                <span className="font-bold text-red-600">{calculatedMetrics.paymentRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${calculatedMetrics.paymentRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg">
              <span className="text-gray-700 font-medium">Workspace Ativo:</span>
              <span className="font-bold text-purple-600">
                {workspace === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(DashboardSummary);
