import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowUpRight, Layers3 } from 'lucide-react';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCashFlowProjection } from '@/hooks/useCashFlowProjection';
import ProjectionTable from '@/components/fluxo/ProjectionTable';
import CashFlowChart from '@/components/fluxo/CashFlowChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const FluxoDeCaixa = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  const [monthsToProject, setMonthsToProject] = useState(12);
  
  const { transactions, loading } = useSupabaseFinancialData();
  const { projection } = useCashFlowProjection(transactions, currentWorkspace, monthsToProject);

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
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  Projeção operacional
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  Fluxo de Caixa Projetado
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Visão futura do caixa com horizonte ajustável e leitura imediata das pressões de entrada e saída.
                </p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="projection-months" className="text-sm">Projetar por</Label>
                <Select 
                  value={monthsToProject.toString()} 
                  onValueChange={(value) => setMonthsToProject(parseInt(value))}
                >
                  <SelectTrigger className="w-[190px] rounded-xl">
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
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card variant="soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <ArrowUpRight className="h-4 w-4 text-primary" />
                Tendência projetada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowChart projection={projection} />
            </CardContent>
          </Card>

          <Card variant="soft">
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Resumo da projeção</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectionTable projection={projection} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FluxoDeCaixa;
