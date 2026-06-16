import React from 'react';
import { DollarSign, Percent, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DREMetrics } from '@/hooks/useProfitLoss';
import { cn } from '@/lib/utils';

interface ProfitIndicatorsProps {
  metrics: DREMetrics;
}

const ProfitIndicators: React.FC<ProfitIndicatorsProps> = ({ metrics }) => {
  const cards = [
    {
      label: 'Margem bruta',
      value: `${metrics.margemBrutaPercent.toFixed(1)}%`,
      helper: 'Receita líquida sobre receita bruta',
      icon: Percent,
      tone: metrics.margemBrutaPercent >= 30 ? 'text-emerald-700 dark:text-emerald-300' : metrics.margemBrutaPercent >= 10 ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300',
      chip: metrics.margemBrutaPercent >= 30 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : metrics.margemBrutaPercent >= 10 ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    },
    {
      label: 'Margem líquida',
      value: `${metrics.margemLiquidaPercent.toFixed(1)}%`,
      helper: 'Lucro líquido sobre receita bruta',
      icon: DollarSign,
      tone: metrics.margemLiquidaPercent >= 15 ? 'text-emerald-700 dark:text-emerald-300' : metrics.margemLiquidaPercent >= 0 ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300',
      chip: metrics.margemLiquidaPercent >= 15 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : metrics.margemLiquidaPercent >= 0 ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    },
    {
      label: 'EBITDA',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.ebitda),
      helper: 'Resultado operacional antes de juros e impostos',
      icon: Zap,
      tone: metrics.ebitda >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-rose-700 dark:text-rose-300',
      chip: metrics.ebitda >= 0 ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.label}
            variant="soft"
            className="overflow-hidden border-border/60 bg-background/95 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.22)]"
          >
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{card.label}</div>
                  <div className={cn('mt-2 text-[1.85rem] font-semibold tracking-tight', card.tone)}>{card.value}</div>
                </div>
                <div className={cn('rounded-full border p-2', card.chip)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="rounded-[1.1rem] border border-border/60 bg-surface/80 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
                {card.helper}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfitIndicators;
