import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Filter, LineChart } from 'lucide-react';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import LoadingSpinner from '@/components/LoadingSpinner';
import DateRangeFilter, { DateRangeState, PresetName } from '@/components/DateRangeFilter';
import { useProfitLoss } from '@/hooks/useProfitLoss';
import DRETable from '@/components/lucro/DRETable';
import ProfitIndicators from '@/components/lucro/ProfitIndicators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createAllPeriodDateRangeState, createCurrentMonthDateRangeState } from '@/lib/financialPeriods';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Lucro = () => {
  const now = new Date();
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');

  const [dateRange, setDateRange] = useState<DateRangeState>(createCurrentMonthDateRangeState(now));

  const { transactions, categories, loading } = useSupabaseFinancialData();

  const { dreMetrics, loading: dreLoading } = useProfitLoss(
    transactions,
    categories,
    currentWorkspace,
    dateRange.startDate,
    dateRange.endDate,
  );

  const handleRangeChange = (start: Date | undefined, end: Date | undefined, presetName: PresetName) => {
    setDateRange({ startDate: start, endDate: end, presetName });
  };

  const handleClearFilter = () => {
    setDateRange(createAllPeriodDateRangeState());
  };

  if (loading || dreLoading) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => {}}
      >
        <LoadingSpinner text="Calculando DRE..." />
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
                    Resultado e margem
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    {currentWorkspace}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-semibold tracking-tight text-foreground lg:text-[2rem]">
                    DRE com leitura mais limpa de estrutura, margem e lucro final.
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Uma superfície analítica contínua para acompanhar receita líquida, contribuição, EBITDA e lucro líquido sem competir com o restante da interface.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <DateRangeFilter
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  presetName={dateRange.presetName}
                  onRangeChange={handleRangeChange}
                  onClear={handleClearFilter}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-border/60 bg-background/88 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Receita líquida</div>
              <div className="mt-2 text-xl font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(dreMetrics.receitaLiquida)}</div>
            </div>
            <div className="rounded-[1.2rem] border border-border/60 bg-background/88 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">EBITDA</div>
              <div className={`mt-2 text-xl font-semibold ${dreMetrics.ebitda >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {formatCurrency(dreMetrics.ebitda)}
              </div>
            </div>
            <div className="rounded-[1.2rem] border border-border/60 bg-background/88 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Lucro líquido</div>
              <div className={`mt-2 text-xl font-semibold ${dreMetrics.lucroLiquido >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {formatCurrency(dreMetrics.lucroLiquido)}
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfitIndicators metrics={dreMetrics} />
        <DRETable metrics={dreMetrics} />
      </div>
    </Layout>
  );
};

export default Lucro;
