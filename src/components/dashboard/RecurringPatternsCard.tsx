import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/financial';
import {
  analyzeTransactionPatterns,
  formatPatternCadence,
  formatPatternSpan,
  TransactionPatternInsight,
} from '@/lib/transactionPatternInsights';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Repeat, TriangleAlert } from 'lucide-react';

interface RecurringPatternsCardProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatGap = (pattern: TransactionPatternInsight) => {
  if (pattern.medianGapDays === null) return 'intervalo irregular';
  return `mediana ${pattern.medianGapDays.toFixed(0)} dias`;
};

const PatternRow: React.FC<{ pattern: TransactionPatternInsight }> = ({ pattern }) => {
  const DirectionIcon = pattern.direction === 'entrada' ? ArrowUpRight : ArrowDownLeft;

  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-foreground">{pattern.label}</h4>
            <Badge variant="outline" className="rounded-full border-border/70 bg-surface/70 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]">
              {pattern.direction === 'entrada' ? 'Entrada' : 'Saida'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(pattern.amount)} · {pattern.rowCount} linhas · {pattern.uniqueDateCount} datas · {formatGap(pattern)}
          </p>
        </div>

        <div className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
          pattern.inflationRisk
            ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        )}>
          <DirectionIcon className="h-3.5 w-3.5" />
          {pattern.cadence === 'irregular' ? 'Fluxo irregular' : formatPatternCadence(pattern.cadence)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary" className="rounded-full">
          {formatPatternSpan(pattern)}
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          Score {pattern.recurrenceScore}
        </Badge>
        {pattern.inflationRows > 0 && (
          <Badge variant="secondary" className="rounded-full border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
            +{pattern.inflationRows} linhas infladas
          </Badge>
        )}
      </div>
    </div>
  );
};

const RecurringPatternsCard: React.FC<RecurringPatternsCardProps> = ({
  transactions,
  workspace,
  startDate,
  endDate,
}) => {
  const insights = useMemo(
    () => analyzeTransactionPatterns(transactions, workspace, startDate, endDate),
    [transactions, workspace, startDate, endDate],
  );

  return (
    <Card variant="soft" className="overflow-hidden border-border/60 bg-background/95 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Repeat className="h-4 w-4 text-primary" />
          Padroes recorrentes
        </CardTitle>
        <CardDescription>
          Leitura das series que se repetem de verdade, com diferenca entre fluxo observado e projeção inflada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Series</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{insights.totalPatterns}</div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Entradas</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{insights.recurringIncomePatterns}</div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Saidas</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{insights.recurringExpensePatterns}</div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Infladas</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{insights.inflatedSeriesCount}</div>
          </div>
        </div>

        {insights.topPatterns.length > 0 ? (
          <div className="space-y-3">
            {insights.topPatterns.map((pattern) => (
              <PatternRow key={pattern.key} pattern={pattern} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface/70 p-4 text-sm text-muted-foreground">
            Nenhuma serie com recorrencia forte foi encontrada no recorte atual.
          </div>
        )}

        {insights.inflatedSeries.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Atenção na recorrencia projetada</p>
                <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
                  Algumas series estao com mais linhas do que datas realmente observadas. Isso e comum quando o gerador cria filhos de filhos, como aconteceu com o exemplo do Heitor.
                </p>
              </div>
            </div>
          </div>
        )}

        {insights.recurringIncome.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Entradas recorrentes fortes</div>
            <div className="grid gap-2">
              {insights.recurringIncome.slice(0, 3).map((pattern) => (
                <div key={pattern.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm">
                  <span className="truncate text-foreground">{pattern.label}</span>
                  <span className="shrink-0 text-muted-foreground">{pattern.uniqueDateCount} datas</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.recurringExpenses.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Saidas recorrentes fortes</div>
            <div className="grid gap-2">
              {insights.recurringExpenses.slice(0, 3).map((pattern) => (
                <div key={pattern.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm">
                  <span className="truncate text-foreground">{pattern.label}</span>
                  <span className="shrink-0 text-muted-foreground">{pattern.uniqueDateCount} datas</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecurringPatternsCard;
