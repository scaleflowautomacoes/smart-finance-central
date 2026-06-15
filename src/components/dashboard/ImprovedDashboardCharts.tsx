import React from 'react';
import { useCentralMetrics } from '@/hooks/useCentralMetrics';
import { Transaction } from '@/types/financial';
import { ChartCard } from './ChartCard';
import { StatusBadge } from './StatusBadge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTheme } from 'next-themes';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ImprovedDashboardChartsProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium text-foreground">
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
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[150px]">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatCurrency(data.value)}
        </span>
      </div>
    );
  }
  return null;
};

export const ImprovedDashboardCharts: React.FC<ImprovedDashboardChartsProps> = ({
  transactions,
  workspace,
  startDate,
  endDate,
}) => {
  const { theme } = useTheme();
  const { metrics } = useCentralMetrics({
    transactions,
    workspace,
    startDate,
    endDate,
  });

  const textColor = theme === 'dark' ? '#e2e8f0' : '#334155';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  // Dados para gráfico de pizza (distribuição financeira)
  const pieData = [
    { name: 'Entradas', value: metrics.entradasRealizadas, fill: CHART_COLORS.income.main },
    { name: 'Saídas', value: metrics.saidasRealizadas, fill: CHART_COLORS.expense.main },
  ].filter(item => item.value > 0);

  // Dados para gráfico de barras (previsto vs realizado)
  const barData = [
    {
      name: 'Entradas',
      Previsto: metrics.entradasPrevistas,
      Realizado: metrics.entradasRealizadas,
    },
    {
      name: 'Saídas',
      Previsto: metrics.saidasPrevistas,
      Realizado: metrics.saidasRealizadas,
    },
  ];

  const hasData = pieData.length > 0 || barData.some(d => d.Previsto > 0 || d.Realizado > 0);

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição Financeira">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Minus className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sem dados para exibir</p>
            <p className="text-sm">Adicione transações para ver a distribuição</p>
          </div>
        </ChartCard>
        <ChartCard title="Previsto vs Realizado">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Minus className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sem dados para exibir</p>
            <p className="text-sm">Adicione transações para ver a comparação</p>
          </div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pizza - Distribuição Financeira */}
      <ChartCard 
        title="Distribuição Financeira"
        headerRight={
          <StatusBadge 
            status="neutral" 
            label="Realizado no período"
          />
        }
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Gráfico de Barras - Previsto vs Realizado */}
      <ChartCard 
        title="Previsto vs Realizado"
        headerRight={
          <div className="flex items-center gap-2">
            <StatusBadge status="neutral" label="Previsto" />
            <StatusBadge status="healthy" label="Realizado" />
          </div>
        }
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: textColor }} />
              <YAxis tick={{ fill: textColor }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Previsto" fill={CHART_COLORS.projection.main} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Realizado" fill={CHART_COLORS.primary.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};