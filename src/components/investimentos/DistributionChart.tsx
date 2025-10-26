import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Investment } from '@/types/financial';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CHART_COLORS, formatCurrency, getRandomCategoryColor } from '@/utils/chartColors';
import { useTheme } from 'next-themes';

interface DistributionChartProps {
  investments: Investment[];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ investments }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const textColor = isDarkMode ? CHART_COLORS.neutral[300] : CHART_COLORS.neutral[600];

  const chartData = useMemo(() => {
    const distributionMap: { [key: string]: number } = {};
    
    investments.filter(i => i.status === 'active').forEach(i => {
      distributionMap[i.type] = (distributionMap[i.type] || 0) + i.current_amount;
    });

    return Object.entries(distributionMap).map(([type, amount], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value: amount,
      color: getRandomCategoryColor(index),
    }));
  }, [investments]);
  
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalAmount > 0 ? ((data.value / totalAmount) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-[180px]">
          <div className="flex items-center mb-2">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-semibold text-foreground">{data.name}</span>
          </div>
          <div className="text-lg font-bold" style={{ color: data.payload.color }}>
            {formatCurrency(data.value)}
          </div>
          <div className="text-sm text-muted-foreground">
            {percentage}% da carteira
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5 text-purple-600" />
          <span>Distribuição da Carteira por Tipo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 p-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right" 
                wrapperStyle={{ fontSize: '12px', color: textColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <DollarSign className="w-10 h-10 mx-auto mb-3" />
            <p>Nenhum ativo ativo para calcular a distribuição.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DistributionChart;