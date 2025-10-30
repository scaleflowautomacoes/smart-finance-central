import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Investment } from '@/types/financial';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react'; // Adicionado DollarSign
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';
import { useTheme } from 'next-themes';

interface PerformanceChartProps {
  investments: Investment[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ investments }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const textColor = isDarkMode ? CHART_COLORS.neutral[300] : CHART_COLORS.neutral[600];
  const gridColor = isDarkMode ? CHART_COLORS.neutral[700] : CHART_COLORS.neutral[200];

  const chartData = useMemo(() => {
    // Simulação de dados de performance mensal
    const data = [];
    const months = 6;
    let baseValue = 10000;
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Simular crescimento/perda
      const variation = (Math.random() - 0.5) * 1000;
      baseValue += variation;
      
      data.push({
        month: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        ValorAtual: Math.max(0, baseValue),
        Rentabilidade: variation,
      });
    }
    
    return data;
  }, [investments]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const valorAtual = payload.find((p: any) => p.dataKey === 'ValorAtual');
      return (
        <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {valorAtual && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Valor Atual:</span>
              <span className="font-bold text-blue-600 ml-2">
                {formatCurrency(valorAtual.value)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Evolução da Performance da Carteira (Últimos 6 meses)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 p-6">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: textColor, fontSize: 12 }}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="ValorAtual" 
                stroke={CHART_COLORS.balance.main} 
                strokeWidth={2}
                dot={false}
                name="Valor Atual"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <DollarSign className="w-10 h-10 mx-auto mb-3" />
            <p>Cadastre investimentos para ver a performance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;