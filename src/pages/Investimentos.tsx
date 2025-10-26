import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const Investimentos = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  
  return (
    <Layout
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={setCurrentWorkspace}
      onNewTransaction={() => console.log('Nova Transação')}
    >
      <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold flex items-center space-x-3">
          <DollarSign className="h-7 w-7 text-primary" />
          <span>Investimentos e Carteira ({currentWorkspace})</span>
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Módulo Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Implementação de gestão de carteira, cálculo de rentabilidade e gráficos de distribuição.
            </p>
            <p className="mt-2 text-sm text-yellow-600">
              Status: Em desenvolvimento (Fase 3)
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Investimentos;