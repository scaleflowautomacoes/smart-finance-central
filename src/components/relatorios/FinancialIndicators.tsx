import React from 'react';
import { DollarSign, Percent, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialMetrics } from '@/hooks/useFinancialCalculations';
import { formatCurrency } from '@/utils/chartColors';
import { cn } from '@/lib/utils';

interface FinancialIndicatorsProps {
  metrics: FinancialMetrics;
}

const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({ metrics }) => {
  const { totalEntradas, totalSaidas, saldoProjetado } = metrics;

  const margemLucro = totalEntradas > 0 ? (saldoProjetado / totalEntradas) * 100 : 0;
  const taxaPoupanca = totalEntradas > 0 && saldoProjetado > 0 ? (saldoProjetado / totalEntradas) * 100 : 0;
  const relacaoDespesasReceitas = totalEntradas > 0 ? (totalSaidas / totalEntradas) * 100 : 0;

  const indicators = [
    {
      label: 'Margem de lucro',
      value: `${margemLucro.toFixed(1)}%`,
      helper: `${formatCurrency(saldoProjetado)} em saldo projetado`,
      description: 'Quanto da receita permanece após o ciclo do período.',
      icon: Percent,
      tone: margemLucro >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300',
      chip: margemLucro >= 0 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    },
    {
      label: 'Taxa de poupança',
      value: `${taxaPoupanca.toFixed(1)}%`,
      helper: 'Saldo positivo convertido em reserva potencial',
      description: 'Indicador útil para acompanhar sobra operacional e capitalização.',
      icon: DollarSign,
      tone: taxaPoupanca >= 10 ? 'text-sky-700 dark:text-sky-300' : 'text-amber-700 dark:text-amber-300',
      chip: taxaPoupanca >= 10 ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: 'Despesa sobre receita',
      value: `${relacaoDespesasReceitas.toFixed(1)}%`,
      helper: `${formatCurrency(totalSaidas)} consumidos de ${formatCurrency(totalEntradas)}`,
      description: 'Quanto da receita bruta está sendo absorvido por desembolsos.',
      icon: Zap,
      tone: relacaoDespesasReceitas <= 75 ? 'text-emerald-700 dark:text-emerald-300' : relacaoDespesasReceitas <= 90 ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300',
      chip: relacaoDespesasReceitas <= 75 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : relacaoDespesasReceitas <= 90 ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    },
  ] as const;

  return (
    <Card
      variant="soft"
      className="overflow-hidden border-border/60 bg-background/95 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.22)]"
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight text-foreground">Indicadores financeiros</CardTitle>
        <CardDescription className="text-sm">
          Leituras derivadas do fluxo atual para entender eficiência, folga e pressão do período.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <div key={indicator.label} className="rounded-[1.25rem] border border-border/60 bg-surface/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{indicator.label}</div>
                  <div className={cn('mt-2 text-2xl font-semibold tracking-tight', indicator.tone)}>{indicator.value}</div>
                </div>
                <div className={cn('rounded-full border p-2', indicator.chip)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-xs font-medium text-foreground">{indicator.helper}</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">{indicator.description}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FinancialIndicators;
