import React from 'react';
import { ArrowDownRight, ArrowUpRight, Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import { formatCurrency } from '@/utils/chartColors';
import { cn } from '@/lib/utils';

interface ComparativeMetricsProps {
  metrics: ReturnType<typeof useReportMetrics>['metrics'];
}

const toneStyles = {
  income: {
    accent: 'text-emerald-700 dark:text-emerald-300',
    chip: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: ArrowUpRight,
  },
  expense: {
    accent: 'text-rose-700 dark:text-rose-300',
    chip: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    icon: ArrowDownRight,
  },
  balance: {
    accent: 'text-sky-700 dark:text-sky-300',
    chip: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    icon: Landmark,
  },
} as const;

const ComparativeMetrics: React.FC<ComparativeMetricsProps> = ({ metrics }) => {
  const { current, previousWindow, previousYear, variationWindow, variationYear } = metrics;

  const renderVariation = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={cn('font-medium', isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    );
  };

  const cards = [
    {
      label: 'Entradas totais',
      value: current.totalEntradas,
      previousWindowValue: previousWindow.totalEntradas,
      previousYearValue: previousYear?.totalEntradas,
      variationWindow: variationWindow.entradas,
      variationYear: variationYear?.entradas,
      tone: 'income',
      helper: `${formatCurrency(current.entradasRealizadas)} realizadas • ${formatCurrency(current.entradasPrevistas)} previstas`,
      positiveGood: true,
    },
    {
      label: 'Saídas totais',
      value: current.totalSaidas,
      previousWindowValue: previousWindow.totalSaidas,
      previousYearValue: previousYear?.totalSaidas,
      variationWindow: variationWindow.saidas,
      variationYear: variationYear?.saidas,
      tone: 'expense',
      helper: `${formatCurrency(current.saidasRealizadas)} realizadas • ${formatCurrency(current.saidasPrevistas)} previstas`,
      positiveGood: false,
    },
    {
      label: 'Saldo projetado',
      value: current.saldoProjetado,
      previousWindowValue: previousWindow.saldoProjetado,
      previousYearValue: previousYear?.saldoProjetado,
      variationWindow: variationWindow.saldo,
      variationYear: variationYear?.saldo,
      tone: 'balance',
      helper: `${formatCurrency(current.saldoReal)} em saldo realizado`,
      positiveGood: true,
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const tone = toneStyles[card.tone];
        const Icon = tone.icon;
        const variationPositive = card.variationWindow >= 0;
        const variationGood = variationPositive ? card.positiveGood : !card.positiveGood;

        return (
          <Card
            key={card.label}
            variant="soft"
            className="overflow-hidden border-border/60 bg-background/95 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.22)]"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{card.label}</div>
                  <div className={cn('mt-2 text-[1.85rem] font-semibold tracking-tight', tone.accent)}>
                    {formatCurrency(card.value)}
                  </div>
                </div>
                <div className={cn('rounded-full border p-2', tone.chip)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {variationPositive ? (
                  <TrendingUp className={cn('h-4 w-4', variationGood ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300')} />
                ) : (
                  <TrendingDown className={cn('h-4 w-4', variationGood ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300')} />
                )}
                <span className={cn('font-medium', variationGood ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
                  {Math.abs(card.variationWindow).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs janela anterior</span>
              </div>

              <div className="space-y-2 rounded-[1.15rem] border border-border/60 bg-surface/80 px-3.5 py-3">
                <div className="text-xs text-muted-foreground">{card.helper}</div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Janela anterior</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(card.previousWindowValue)} • {renderVariation(card.variationWindow)}
                  </span>
                </div>
                {typeof card.previousYearValue === 'number' && card.variationYear != null && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Mesmo período ano anterior</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(card.previousYearValue)} • {renderVariation(card.variationYear)}
                    </span>
                  </div>
                )}
                {typeof card.previousYearValue !== 'number' && (
                  <div className="text-xs text-muted-foreground">
                    Sem histórico anual suficiente para comparação adicional.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ComparativeMetrics;
