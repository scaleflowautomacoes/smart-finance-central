import React, { useMemo } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MonthlyProjection } from '@/hooks/useCashFlowProjection';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';

interface CashFlowChartProps {
  projection: MonthlyProjection[];
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

const CashFlowChart: React.FC<CashFlowChartProps> = ({ projection }) => {
  const hasDeficit = projection.some((item) => item.saldoAcumulado < 0);

  const summary = useMemo(() => {
    if (projection.length === 0) {
      return { finalBalance: 0, monthlyAverage: 0, worstBalance: 0 };
    }

    const finalBalance = projection[projection.length - 1]?.saldoAcumulado ?? 0;
    const monthlyAverage = projection.reduce((sum, item) => sum + item.saldoMes, 0) / projection.length;
    const worstBalance = projection.reduce((lowest, item) => Math.min(lowest, item.saldoAcumulado), Number.POSITIVE_INFINITY);

    return { finalBalance, monthlyAverage, worstBalance };
  }, [projection]);

  const CustomTooltip = ({ active, payload, label }: TooltipState) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="min-w-[210px] rounded-2xl border border-border/70 bg-background/95 p-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur">
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

  return (
    <ChartCard
      title="Tendência projetada do caixa"
      headerRight={
        <Badge variant="outline" className="rounded-full border-border/60 bg-surface/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Horizonte futuro
        </Badge>
      }
      contentClassName="space-y-5"
      className="border-border/60 bg-background/95"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Saldo final</div>
          <div className="mt-2 text-lg font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(summary.finalBalance)}</div>
        </div>
        <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Média mensal</div>
          <div className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(summary.monthlyAverage)}</div>
        </div>
        <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Pior saldo</div>
          <div className="mt-2 text-lg font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(summary.worstBalance)}</div>
        </div>
      </div>

      <div className="h-[22rem]">
        {projection.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.neutral[200]} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                tick={{ fill: CHART_COLORS.neutral[500], fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: CHART_COLORS.neutral[500], fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: CHART_COLORS.neutral[500], paddingTop: '12px' }}
              />
              <ReferenceLine y={0} stroke={CHART_COLORS.expense.main} strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="saldoAcumulado"
                stroke={CHART_COLORS.balance.main}
                strokeWidth={2.4}
                dot={false}
                name="Saldo acumulado"
              />
              <Line
                type="monotone"
                dataKey="saldoMes"
                stroke={CHART_COLORS.projection.main}
                strokeWidth={1.8}
                strokeDasharray="5 5"
                dot={false}
                name="Saldo do mês"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-surface/70 px-6 text-center">
            <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/60" />
            <div className="text-sm font-medium text-foreground">Nenhuma projeção disponível.</div>
            <div className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              Assim que houver transações ativas suficientes, o horizonte futuro do caixa aparecerá aqui.
            </div>
          </div>
        )}
      </div>

      {hasDeficit && (
        <div className="flex items-start gap-3 rounded-[1.15rem] border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Há meses futuros com saldo acumulado negativo. Vale antecipar cobrança ou reduzir compromissos antes do período crítico.</span>
        </div>
      )}
    </ChartCard>
  );
};

export default CashFlowChart;
