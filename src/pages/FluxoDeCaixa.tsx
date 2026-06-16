import React, { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { Calendar, Layers3 } from 'lucide-react';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCashFlowProjection } from '@/hooks/useCashFlowProjection';
import ProjectionTable from '@/components/fluxo/ProjectionTable';
import CashFlowChart from '@/components/fluxo/CashFlowChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const FluxoDeCaixa = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  const [monthsToProject, setMonthsToProject] = useState(12);

  const { transactions, loading } = useSupabaseFinancialData();
  const { projection } = useCashFlowProjection(transactions, currentWorkspace, monthsToProject);

  const summary = useMemo(() => {
    if (projection.length === 0) {
      return {
        totalReceitas: 0,
        totalDespesas: 0,
        finalBalance: 0,
      };
    }

    return projection.reduce(
      (acc, item, index) => {
        acc.totalReceitas += item.receitasPrevistas;
        acc.totalDespesas += item.despesasPrevistas;
        if (index === projection.length - 1) {
          acc.finalBalance = item.saldoAcumulado;
        }
        return acc;
      },
      { totalReceitas: 0, totalDespesas: 0, finalBalance: 0 },
    );
  }, [projection]);

  if (loading) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => {}}
      >
        <LoadingSpinner text="Calculando projeções..." />
      </Layout>
    );
  }

  return (
    <Layout
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={setCurrentWorkspace}
      onNewTransaction={() => {}}
    >
      <div className="space-y-6 p-4 lg:p-6">
        <Card
          variant="soft"
          className="overflow-hidden border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)]"
        >
          <CardHeader className="gap-4 pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    Projeção operacional
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    {currentWorkspace}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-semibold tracking-tight text-foreground lg:text-[2rem]">
                    Fluxo de caixa projetado com leitura clara de horizonte e pressão futura.
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Ajuste o horizonte e acompanhe como receitas previstas, despesas futuras e saldo acumulado se comportam ao longo dos próximos meses.
                  </CardDescription>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="projection-months" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Horizonte
                </Label>
                <Select value={monthsToProject.toString()} onValueChange={(value) => setMonthsToProject(parseInt(value, 10))}>
                  <SelectTrigger id="projection-months" className="h-11 w-[210px] rounded-2xl border-border/70 bg-background/90 shadow-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Próximos 3 meses</SelectItem>
                    <SelectItem value="6">Próximos 6 meses</SelectItem>
                    <SelectItem value="12">Próximos 12 meses</SelectItem>
                    <SelectItem value="24">Próximos 24 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-border/60 bg-background/88 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Receitas projetadas</div>
              <div className="mt-2 text-xl font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(summary.totalReceitas)}</div>
            </div>
            <div className="rounded-[1.2rem] border border-border/60 bg-background/88 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Despesas projetadas</div>
              <div className="mt-2 text-xl font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(summary.totalDespesas)}</div>
            </div>
            <div className="rounded-[1.2rem] border border-border/60 bg-background/88 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Saldo acumulado final</div>
              <div className="mt-2 text-xl font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(summary.finalBalance)}</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <CashFlowChart projection={projection} />
          <ProjectionTable projection={projection} />
        </div>
      </div>
    </Layout>
  );
};

export default FluxoDeCaixa;
