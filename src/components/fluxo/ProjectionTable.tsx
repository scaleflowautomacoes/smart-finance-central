import React from 'react';
import { CalendarRange } from 'lucide-react';
import { MonthlyProjection } from '@/hooks/useCashFlowProjection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';

interface ProjectionTableProps {
  projection: MonthlyProjection[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ProjectionTable: React.FC<ProjectionTableProps> = ({ projection }) => {
  return (
    <ChartCard
      title="Resumo da projeção mensal"
      headerRight={
        <Badge variant="outline" className="rounded-full border-border/60 bg-surface/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Tabela analítica
        </Badge>
      }
      contentClassName="space-y-4"
      className="border-border/60 bg-background/95"
    >
      {projection.length > 0 ? (
        <>
          <div className="rounded-[1.15rem] border border-border/60 bg-surface/80 p-3 text-xs leading-5 text-muted-foreground">
            A tabela consolida o horizonte projetado mês a mês para conferir entrada prevista, saída esperada e saldo acumulado.
          </div>

          <div className="overflow-x-auto rounded-[1.2rem] border border-border/60 bg-background/90">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="w-[150px] py-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Período</TableHead>
                  <TableHead className="py-4 text-right text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Receitas</TableHead>
                  <TableHead className="py-4 text-right text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Despesas</TableHead>
                  <TableHead className="py-4 text-right text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Saldo do mês</TableHead>
                  <TableHead className="py-4 text-right text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Saldo acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projection.map((item, index) => (
                  <TableRow
                    key={`${item.monthLabel}-${index}`}
                    className={item.saldoAcumulado < 0 ? 'border-border/60 bg-rose-500/5 hover:bg-rose-500/10' : 'border-border/60'}
                  >
                    <TableCell className="py-4 font-medium text-foreground">{item.monthLabel}</TableCell>
                    <TableCell className="py-4 text-right font-medium text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(item.receitasPrevistas)}
                    </TableCell>
                    <TableCell className="py-4 text-right font-medium text-rose-700 dark:text-rose-300">
                      {formatCurrency(item.despesasPrevistas)}
                    </TableCell>
                    <TableCell className={`py-4 text-right font-semibold ${item.saldoMes >= 0 ? 'text-foreground' : 'text-rose-700 dark:text-rose-300'}`}>
                      {formatCurrency(item.saldoMes)}
                    </TableCell>
                    <TableCell className={`py-4 text-right font-semibold ${item.saldoAcumulado >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {formatCurrency(item.saldoAcumulado)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-surface/70 px-6 text-center">
          <CalendarRange className="mb-3 h-8 w-8 text-muted-foreground/60" />
          <div className="text-sm font-medium text-foreground">Sem linhas projetadas no horizonte atual.</div>
          <div className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            Ajuste o período ou cadastre transações previstas para acompanhar a evolução futura do caixa.
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default ProjectionTable;
