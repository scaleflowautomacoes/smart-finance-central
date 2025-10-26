import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardMetrics, Transaction } from '@/types/financial';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { useTheme } from 'next-themes';

interface DashboardChartsProps {
  workspace: 'PF' | 'PJ';
  transactions: Transaction[];
  startDate?: Date;
  endDate?: Date;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ workspace, transactions, startDate, endDate }) => {
  const metrics = useFinancialCalculations(transactions, workspace, startDate, endDate);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const textColor = isDarkMode ? CHART_COLORS.neutral[300] : CHART_COLORS.neutral[600];
  const gridColor = isDarkMode ? CHART_COLORS.neutral[700] : CHART_COLORS.neutral[200];

  // Dados para o gráfico de pizza (Distribuição de Entradas vs Saídas)
  const pieData = [
    {
      name: 'Entradas Realizadas',
      value: metrics.entradasRealizadas,
      color: CHART_COLORS.income.main,
      gradient: CHART_COLORS.income.gradient,
    },
    {
      name: 'Saídas Pagas',
      value: metrics.saidasRealizadas,
      color: CHART_COLORS.expense.main,
      gradient: CHART_COLORS.expense.gradient,
    }
  ].filter(d => d.value > 0);

  // Dados para o gráfico de barras (Previsto vs Realizado)
  const barData = [
    {
      name: 'Entradas',
      Previsto: metrics.entradasPrevistas,
      Realizado: metrics.entradasRealizadas
    },
    {
      name: 'Saídas',
      Previsto: metrics.saidasPrevistas,
      Realizado: metrics.saidasRealizadas
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-medium text-foreground ml-2">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[180px]">
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
            {((data.value / total) * 100).toFixed(1)}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de Pizza - Distribuição */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-gray-50/50 dark:to-gray-900/50">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="text-foreground">Distribuição Financeira</span>
            <span className="text-sm font-normal text-muted-foreground bg-background px-3 py-1 rounded-full border">
              {workspace === 'PF' ? 'Pessoal' : 'Empresa'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pieData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity duration-200"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-8 mt-6">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-foreground">{entry.name}</div>
                      <div 
                        className="font-bold text-lg"
                        style={{ color: entry.color }}
                      >
                        {formatCurrency(entry.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Nenhuma transação realizada no período.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Previsto vs Realizado */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-gray-50/50 dark:to-gray-900/50">
        <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-lg text-foreground">Previsto vs Realizado</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="previstoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.neutral[400]} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={CHART_COLORS.neutral[400]} stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="realizadoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary.blue} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={CHART_COLORS.primary.blue} stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={{ stroke: gridColor }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="Previsto" 
                  fill="url(#previstoGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Previsto"
                />
                <Bar 
                  dataKey="Realizado" 
                  fill="url(#realizadoGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Realizado"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-8 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-gradient-to-r from-gray-400 to-gray-300 rounded-sm" />
              <span className="text-sm font-medium text-foreground">Previsto</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-sm" />
              <span className="text-sm font-medium text-foreground">Realizado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;