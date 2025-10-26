import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction, Category } from '@/types/financial';
import { CHART_COLORS, getRandomCategoryColor, formatCurrency } from '@/utils/chartColors';
import { useTheme } from 'next-themes';

interface CategoryChartsProps {
  transactions: Transaction[];
  categories: Category[];
  workspace: 'PF' | 'PJ';
  periodFilter: {
    startDate?: Date;
    endDate?: Date;
  };
}

const CategoryCharts: React.FC<CategoryChartsProps> = ({ 
  transactions, 
  categories, 
  workspace, 
  periodFilter 
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const textColor = isDarkMode ? CHART_COLORS.neutral[300] : CHART_COLORS.neutral[600];
  const gridColor = isDarkMode ? CHART_COLORS.neutral[700] : CHART_COLORS.neutral[200];
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.deletado || t.origem !== workspace) return false;
      
      if (periodFilter.startDate && periodFilter.endDate) {
        const transactionDate = new Date(t.data);
        if (transactionDate < periodFilter.startDate || transactionDate > periodFilter.endDate) return false;
      }
      
      return true;
    });
  }, [transactions, workspace, periodFilter]);

  const categoryData = useMemo(() => {
    const entradaData: { [key: string]: number } = {};
    const saidaData: { [key: string]: number } = {};

    filteredTransactions.forEach(transaction => {
      const categoryName = categories.find(c => c.id === transaction.categoria_id)?.nome || 'Sem categoria';
      
      if (transaction.tipo === 'entrada') {
        entradaData[categoryName] = (entradaData[categoryName] || 0) + transaction.valor;
      } else {
        saidaData[categoryName] = (saidaData[categoryName] || 0) + transaction.valor;
      }
    });

    return { entradaData, saidaData };
  }, [filteredTransactions, categories]);

  const pieEntradaData = Object.entries(categoryData.entradaData).map(([name, value], index) => ({
    name,
    value,
    color: getRandomCategoryColor(index)
  }));

  const pieSaidaData = Object.entries(categoryData.saidaData).map(([name, value], index) => ({
    name,
    value,
    color: getRandomCategoryColor(index + 6) // Offset para cores diferentes
  }));

  const barData = useMemo(() => {
    const allCategories = new Set([
      ...Object.keys(categoryData.entradaData),
      ...Object.keys(categoryData.saidaData)
    ]);

    return Array.from(allCategories).map(category => ({
      name: category,
      entrada: categoryData.entradaData[category] || 0,
      saida: categoryData.saidaData[category] || 0
    }));
  }, [categoryData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-[200px]">
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
      const total = data.payload.name.includes('entrada') 
        ? pieEntradaData.reduce((sum, item) => sum + item.value, 0)
        : pieSaidaData.reduce((sum, item) => sum + item.value, 0);
      
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
            {((data.value / total) * 100).toFixed(1)}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de Pizza - Entradas por Categoria */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-green-50/50 dark:to-green-900/50">
        <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-lg text-green-700 dark:text-green-400 font-bold">
            Distribuição de Entradas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pieEntradaData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieEntradaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieEntradaData.map((entry, index) => (
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
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                {pieEntradaData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="font-medium text-foreground">{entry.name}</span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <p>Nenhuma entrada encontrada no período</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Saídas por Categoria */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-red-50/50 dark:to-red-900/50">
        <CardHeader className="bg-gradient-to-r from-red-50/50 to-rose-50/50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-lg text-red-700 dark:text-red-400 font-bold">
            Distribuição de Saídas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pieSaidaData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieSaidaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieSaidaData.map((entry, index) => (
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
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                {pieSaidaData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="font-medium text-foreground">{entry.name}</span>
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="w-8 h-8 text-muted-foreground" />
                </div>
                <p>Nenhuma saída encontrada no período</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Comparativo por Categoria */}
      <Card className="lg:col-span-2 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-indigo-50/50 dark:to-indigo-900/50">
        <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-lg text-foreground font-bold">
            Comparativo: Entradas vs Saídas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {barData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="entradaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.income.main} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={CHART_COLORS.income.light} stopOpacity={0.4}/>
                    </linearGradient>
                    <linearGradient id="saidaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.expense.main} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={CHART_COLORS.expense.light} stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
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
                  <Bar 
                    dataKey="entrada" 
                    fill="url(#entradaGradient)" 
                    name="Entradas" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="saida" 
                    fill="url(#saidaGradient)" 
                    name="Saídas" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-lg">Nenhuma transação encontrada no período</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryCharts;