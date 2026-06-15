import React from 'react';
import { useCentralMetrics } from '@/hooks/useCentralMetrics';
import { Transaction, Category } from '@/types/financial';
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
import { CHART_COLORS, getRandomCategoryColor, formatCurrency } from '@/utils/chartColors';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ImprovedCategoryChartsProps {
  transactions: Transaction[];
  categories: Category[];
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

export const ImprovedCategoryCharts: React.FC<ImprovedCategoryChartsProps> = ({
  transactions,
  categories,
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

  // Mapear IDs de categorias para nomes
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.nome || 'Sem categoria';
  };

  // Dados para gráficos de pizza por categoria
  const entradasPorCategoria = metrics.entradasPorCategoria.map((item, index) => ({
    name: getCategoryName(item.categoria),
    value: item.valor,
    fill: getRandomCategoryColor(index),
  }));

  const saidasPorCategoria = metrics.saidasPorCategoria.map((item, index) => ({
    name: getCategoryName(item.categoria),
    value: item.valor,
    fill: getRandomCategoryColor(index + 6),
  }));

  // Dados para gráfico comparativo
  const todasCategorias = [
    ...metrics.entradasPorCategoria.map(item => ({
      categoria: getCategoryName(item.categoria),
      entradas: item.valor,
      saidas: 0,
    })),
    ...metrics.saidasPorCategoria.map(item => ({
      categoria: getCategoryName(item.categoria),
      entradas: 0,
      saidas: item.valor,
    })),
  ];

  // Agrupar por categoria
  const categoriasCombinadas = todasCategorias.reduce((acc, item) => {
    const existing = acc.find(a => a.categoria === item.categoria);
    if (existing) {
      existing.entradas += item.entradas;
      existing.saidas += item.saidas;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as { categoria: string; entradas: number; saidas: number }[]);

  // Ordenar por valor total
  const barData = categoriasCombinadas
    .sort((a, b) => (b.entradas + b.saidas) - (a.entradas + a.saidas))
    .slice(0, 10); // Top 10 categorias

  const hasEntradas = entradasPorCategoria.length > 0;
  const hasSaidas = saidasPorCategoria.length > 0;
  const hasBarData = barData.length > 0;

  if (!hasEntradas && !hasSaidas && !hasBarData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Entradas por Categoria">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sem entradas para exibir</p>
            <p className="text-sm">Adicione entradas para ver a distribuição</p>
          </div>
        </ChartCard>
        <ChartCard title="Saídas por Categoria">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <TrendingDown className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sem saídas para exibir</p>
            <p className="text-sm">Adicione saídas para ver a distribuição</p>
          </div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráficos de Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entradas por Categoria */}
        <ChartCard 
          title="Entradas por Categoria"
          headerRight={
            <StatusBadge status="healthy" label="Receitas" />
          }
        >
          {hasEntradas ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entradasPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {entradasPorCategoria.map((entry, index) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Sem entradas</p>
            </div>
          )}
        </ChartCard>

        {/* Saídas por Categoria */}
        <ChartCard 
          title="Saídas por Categoria"
          headerRight={
            <StatusBadge status="critical" label="Despesas" />
          }
        >
          {hasSaidas ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={saidasPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {saidasPorCategoria.map((entry, index) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Sem saídas</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Gráfico Comparativo */}
      {hasBarData && (
        <ChartCard 
          title="Comparativo Entradas vs Saídas por Categoria"
          headerRight={
            <div className="flex items-center gap-2">
              <StatusBadge status="healthy" label="Entradas" />
              <StatusBadge status="critical" label="Saídas" />
            </div>
          }
        >
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={barData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="categoria" 
                  tick={{ fill: textColor }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill={CHART_COLORS.income.main} radius={[6, 6, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill={CHART_COLORS.expense.main} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
};