import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction } from '@/types/financial';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';
import { useTheme } from 'next-themes';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MonthlyTrendChartProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
}

interface MonthData {
  month: string;
  monthLabel: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ transactions, workspace }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const textColor = isDarkMode ? CHART_COLORS.neutral[300] : CHART_COLORS.neutral[600];
  const gridColor = isDarkMode ? CHART_COLORS.neutral[700] : CHART_COLORS.neutral[200];

  // Calcular dados dos últimos 6 meses
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: MonthData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = transactions.filter(t => {
        if (t.origem !== workspace || t.deletado || t.recorrencia_ativa === false) {
          return false;
        }
        const transactionDate = new Date(t.data);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      });

      const entradas = monthTransactions
        .filter(t => t.tipo === 'entrada' && t.status === 'realizada')
        .reduce((sum, t) => sum + t.valor, 0);

      const saidas = monthTransactions
        .filter(t => t.tipo === 'saida' && t.status === 'realizada')
        .reduce((sum, t) => sum + t.valor, 0);

      months.push({
        month: format(monthDate, 'yyyy-MM'),
        monthLabel: format(monthDate, 'MMM', { locale: ptBR }).toUpperCase(),
        entradas,
        saidas,
        saldo: entradas - saidas
      });
    }

    return months;
  }, [transactions, workspace]);

  // Calcular variação mês a mês
  const trend = useMemo(() => {
    if (monthlyData.length < 2) return { value: 0, type: 'neutral' as const };
    
    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    
    if (previousMonth.saldo === 0) return { value: 0, type: 'neutral' as const };
    
    const variation = ((currentMonth.saldo - previousMonth.saldo) / Math.abs(previousMonth.saldo)) * 100;
    
    return {
      value: Math.abs(variation),
      type: variation > 0 ? 'up' as const : variation < 0 ? 'down' as const : 'neutral' as const
    };
  }, [monthlyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-3 text-base">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
              </div>
              <span 
                className="font-semibold ml-3"
                style={{ color: entry.color }}
              >
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const TrendIcon = trend.type === 'up' ? TrendingUp : trend.type === 'down' ? TrendingDown : Minus;
  const trendColor = trend.type === 'up' ? 'text-emerald-500' : trend.type === 'down' ? 'text-rose-500' : 'text-muted-foreground';

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-gray-50/50 dark:to-gray-900/50">
      <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Evolução Financeira</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full border bg-background ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {trend.value.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">vs mês anterior</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="entradasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.income.main} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={CHART_COLORS.income.main} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="saidasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.expense.main} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={CHART_COLORS.expense.main} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (Math.abs(value) >= 1000) {
                    return `R$ ${(value / 1000).toFixed(0)}k`;
                  }
                  return `R$ ${value}`;
                }}
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => <span className="text-sm font-medium text-foreground">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="entradas"
                fill="url(#entradasGradient)"
                stroke="transparent"
                name="Entradas"
              />
              <Area
                type="monotone"
                dataKey="saidas"
                fill="url(#saidasGradient)"
                stroke="transparent"
                name="Saídas"
              />
              <Line
                type="monotone"
                dataKey="entradas"
                stroke={CHART_COLORS.income.main}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.income.main, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: CHART_COLORS.income.main, strokeWidth: 2 }}
                name="Entradas"
              />
              <Line
                type="monotone"
                dataKey="saidas"
                stroke={CHART_COLORS.expense.main}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.expense.main, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: CHART_COLORS.expense.main, strokeWidth: 2 }}
                name="Saídas"
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke={CHART_COLORS.primary.blue}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: CHART_COLORS.primary.blue, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: CHART_COLORS.primary.blue, strokeWidth: 2 }}
                name="Saldo"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo dos últimos meses */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Entradas (6 meses)</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.entradas, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Saídas (6 meses)</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.saidas, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Saldo Acumulado</div>
            <div className={`text-lg font-bold ${
              monthlyData.reduce((sum, m) => sum + m.saldo, 0) >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.saldo, 0))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendChart;
