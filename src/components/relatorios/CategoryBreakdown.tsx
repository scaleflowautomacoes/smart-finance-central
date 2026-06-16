import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Category, Transaction } from '@/types/financial';
import { formatCurrency, getRandomCategoryColor, CHART_COLORS } from '@/utils/chartColors';
import { isFinancialDateWithinRange } from '@/utils/financialDate';
import { buildDerivedCategoryMap, dedupeGeneratedRecurrences, resolveEffectiveCategoryId } from '@/lib/financialAnalytics';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  categories: Category[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color?: string;
  fill?: string;
}

interface TooltipState {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const truncateLabel = (value: string) => (value.length > 16 ? `${value.slice(0, 16)}...` : value);

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  transactions,
  categories,
  workspace,
  startDate,
  endDate,
}) => {
  const data = useMemo(() => {
    const filteredTransactions = dedupeGeneratedRecurrences(transactions).filter((transaction) => {
      if (transaction.origem !== workspace || transaction.deletado || transaction.status !== 'realizada') return false;
      return isFinancialDateWithinRange(transaction.data, startDate, endDate);
    });
    const derivedCategories = buildDerivedCategoryMap(filteredTransactions);

    const categoryMap: Record<string, { name: string; entrada: number; saida: number }> = {};

    filteredTransactions.forEach((transaction) => {
      const effectiveCategoryId = resolveEffectiveCategoryId(transaction, derivedCategories);
      const category = categories.find((item) => item.id === effectiveCategoryId);
      const categoryName = category?.nome || 'Sem categoria';

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { name: categoryName, entrada: 0, saida: 0 };
      }

      if (transaction.tipo === 'entrada') {
        categoryMap[categoryName].entrada += transaction.valor;
      } else {
        categoryMap[categoryName].saida += transaction.valor;
      }
    });

    const allData = Object.values(categoryMap);

    const topEntradas = allData
      .filter((item) => item.entrada > 0)
      .sort((a, b) => b.entrada - a.entrada)
      .slice(0, 5)
      .map((item, index) => ({ ...item, shortName: truncateLabel(item.name), color: getRandomCategoryColor(index) }));

    const topSaidas = allData
      .filter((item) => item.saida > 0)
      .sort((a, b) => b.saida - a.saida)
      .slice(0, 5)
      .map((item, index) => ({ ...item, shortName: truncateLabel(item.name), color: getRandomCategoryColor(index + 5) }));

    return { topEntradas, topSaidas };
  }, [transactions, categories, workspace, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: TooltipState) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="min-w-[190px] rounded-2xl border border-border/70 bg-background/95 p-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}
            </div>
            <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCard = (
    title: string,
    tone: 'income' | 'expense',
    rows: Array<{ name: string; shortName: string; entrada: number; saida: number; color: string }>,
  ) => (
    <ChartCard
      title={title}
      headerRight={
        <Badge
          variant="outline"
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            tone === 'income'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          {tone === 'income' ? 'Receitas' : 'Despesas'}
        </Badge>
      }
      contentClassName="space-y-4"
      className="border-border/60 bg-background/95"
    >
      <div className="h-[21rem]">
        {rows.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.neutral[200]} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: CHART_COLORS.neutral[500], fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="shortName"
                type="category"
                width={112}
                tick={{ fill: CHART_COLORS.neutral[600], fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
              <Bar
                dataKey={tone === 'income' ? 'entrada' : 'saida'}
                name={tone === 'income' ? 'Receita' : 'Despesa'}
                radius={[0, 10, 10, 0]}
                barSize={26}
              >
                {rows.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-surface/70 px-6 text-center">
            <div>
              <div className="text-sm font-medium text-foreground">Sem categorias relevantes no recorte.</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                O ranking aparece assim que houver transações realizadas com valor suficiente para comparação.
              </div>
            </div>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="grid gap-2">
          {rows.slice(0, 3).map((row, index) => (
            <div key={row.name} className="flex items-center justify-between gap-3 rounded-[1rem] border border-border/60 bg-surface/75 px-3 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background text-[11px] font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="truncate text-foreground">{row.name}</span>
              </div>
              <span className="font-medium text-foreground">{formatCurrency(tone === 'income' ? row.entrada : row.saida)}</span>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {renderCard('Entradas por categoria', 'income', data.topEntradas)}
      {renderCard('Saídas por categoria', 'expense', data.topSaidas)}
    </div>
  );
};

export default CategoryBreakdown;
