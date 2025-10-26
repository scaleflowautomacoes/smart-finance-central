import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

const Lucro = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  
  return (
    <Layout
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={setCurrentWorkspace}
      onNewTransaction={() => console.log('Nova Transação')}
    >
      <div className="p-4 space-y-6">
        <h1 className="text-3xl font-bold flex items-center space-x-3">
          <Briefcase className="h-7 w-7 text-primary" />
          <span>Demonstrativo de Resultado (DRE) ({currentWorkspace})</span>
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Módulo Lucro (DRE)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Implementação da estrutura DRE, cálculo de margens e indicadores de rentabilidade.
            </p>
            <p className="mt-2 text-sm text-yellow-600">
              Status: Em desenvolvimento (Fase 2)
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Lucro;