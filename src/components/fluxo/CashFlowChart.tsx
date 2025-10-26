import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyProjection } from '@/hooks/useCashFlowProjection';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';

interface CashFlowChartProps {
  projection: MonthlyProjection[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const saldoAcumulado = payload.find((p: any) => p.dataKey === 'saldoAcumulado');
    const saldoMes = payload.find((p: any) => p.dataKey === 'saldoMes');
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[200px]">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {saldoMes && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Saldo do Mês:</span>
            <span className={`font-bold ml-2 ${saldoMes.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoMes.value)}
            </span>
          </div>
        )}
        {saldoAcumulado && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Saldo Acumulado:</span>
            <span className={`font-bold ml-2 ${saldoAcumulado.value >= 0 ? 'text-blue-600' : 'text-red-800'}`}>
              {formatCurrency(saldoAcumulado.value)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CashFlowChart: React.FC<CashFlowChartProps> = ({ projection }) => {
  const hasDeficit = projection.some(p => p.saldoAcumulado < 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Evolução do Saldo Acumulado</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 p-6">
        {projection.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.neutral[200]} />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fill: CHART_COLORS.neutral[600], fontSize: 11 }}
                axisLine={{ stroke: CHART_COLORS.neutral[300] }}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: CHART_COLORS.neutral[600], fontSize: 12 }}
                axisLine={{ stroke: CHART_COLORS.neutral[300] }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Saldo Acumulado */}
              <Line 
                type="monotone" 
                dataKey="saldoAcumulado" 
                stroke={CHART_COLORS.balance.main} 
                strokeWidth={2}
                dot={false}
                name="Saldo Acumulado"
              />
              
              {/* Saldo do Mês (Opcional, para contexto) */}
              <Line 
                type="monotone" 
                dataKey="saldoMes" 
                stroke={CHART_COLORS.projection.main} 
                strokeWidth={1}
                dot={false}
                name="Saldo do Mês"
                opacity={0.5}
              />
              
              {/* Linha de Alerta Zero */}
              <Line 
                type="monotone" 
                dataKey={() => 0} 
                stroke={CHART_COLORS.expense.main} 
                strokeDasharray="5 5" 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <AlertTriangle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p>Nenhuma transação ativa para projetar o fluxo de caixa.</p>
            </div>
          </div>
        )}
        
        {hasDeficit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span>Alerta: O saldo acumulado projeta um déficit em meses futuros.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;