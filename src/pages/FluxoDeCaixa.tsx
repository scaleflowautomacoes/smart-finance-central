import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar } from 'lucide-react';
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
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Briefcase className="h-7 w-7 text-primary" />
            <span>Fluxo de Caixa Projetado ({currentWorkspace})</span>
          </h1>
          
          <div className="space-y-1">
            <Label htmlFor="projection-months" className="text-sm">Projetar por</Label>
            <Select 
              value={monthsToProject.toString()} 
              onValueChange={(value) => setMonthsToProject(parseInt(value))}
            >
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
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

        <div className="space-y-6">
          <CashFlowChart projection={projection} />
          <ProjectionTable projection={projection} />
        </div>
      </div>
    </Layout>
  );
};

export default FluxoDeCaixa;