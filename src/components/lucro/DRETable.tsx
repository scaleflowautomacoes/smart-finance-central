import React from 'react';
import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { DREMetrics } from '@/hooks/useProfitLoss';
import { cn } from '@/lib/utils';

interface DRETableProps {
  metrics: DREMetrics;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const DRETable: React.FC<DRETableProps> = ({ metrics }) => {
  const rows = [
    { label: 'Receita bruta', value: metrics.receitaBruta, tone: 'positive', section: true },
    { label: '(-) Deduções e impostos', value: metrics.deducoesImpostos, tone: 'negative', indent: true },
    { label: 'Receita líquida', value: metrics.receitaLiquida, tone: 'balance', section: true, emphasis: true },
    { label: '(-) Custos variáveis', value: metrics.custosVariaveis, tone: 'negative', indent: true },
    { label: 'Margem de contribuição', value: metrics.margemContribuicao, tone: 'warning', section: true },
    { label: '(-) Custos fixos', value: metrics.custosFixos, tone: 'negative', indent: true },
    { label: 'EBITDA', value: metrics.ebitda, tone: 'balance', section: true, emphasis: true },
    { label: '(-) Despesas financeiras', value: metrics.despesasFinanceiras, tone: 'negative', indent: true },
    { label: '(+) Receitas financeiras', value: metrics.receitasFinanceiras, tone: 'positive', indent: true },
    { label: 'Lucro líquido', value: metrics.lucroLiquido, tone: metrics.lucroLiquido >= 0 ? 'positive' : 'negative', final: true },
  ] as const;

  const valueClass = (tone: string) => {
    switch (tone) {
      case 'positive':
        return 'text-emerald-700 dark:text-emerald-300';
      case 'negative':
        return 'text-rose-700 dark:text-rose-300';
      case 'warning':
        return 'text-amber-700 dark:text-amber-300';
      case 'balance':
        return 'text-sky-700 dark:text-sky-300';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card
      variant="soft"
      className="overflow-hidden border-border/60 bg-background/95 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.22)]"
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
          <Briefcase className="h-4 w-4 text-primary" />
          Demonstrativo de Resultado
        </CardTitle>
        <CardDescription className="text-sm">
          Leitura estruturada da formação do resultado, da receita bruta ao lucro líquido.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Receita líquida</div>
            <div className="mt-2 text-lg font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(metrics.receitaLiquida)}</div>
          </div>
          <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Margem de contribuição</div>
            <div className="mt-2 text-lg font-semibold text-amber-700 dark:text-amber-300">{formatCurrency(metrics.margemContribuicao)}</div>
          </div>
          <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Lucro líquido</div>
            <div className={cn('mt-2 text-lg font-semibold', metrics.lucroLiquido >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
              {formatCurrency(metrics.lucroLiquido)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[1.25rem] border border-border/60 bg-background/90">
          <Table>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.label}
                  className={cn(
                    'border-border/60',
                    row.final && 'bg-emerald-500/5 hover:bg-emerald-500/10',
                    row.emphasis && 'bg-sky-500/4',
                    row.section && !row.final && !row.emphasis && 'bg-surface/55',
                  )}
                >
                  <TableCell className={cn(
                    'py-4 text-sm font-medium text-foreground',
                    row.indent && 'pl-8 font-normal text-muted-foreground',
                    row.section && 'font-semibold',
                    row.final && 'text-base font-semibold',
                  )}>
                    {row.label}
                  </TableCell>
                  <TableCell className={cn(
                    'py-4 text-right text-sm font-medium',
                    valueClass(row.tone),
                    row.section && 'font-semibold',
                    row.final && 'text-base font-semibold',
                  )}>
                    {formatCurrency(row.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DRETable;
