import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Plus, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvestments } from '@/hooks/useInvestments';
import { Investment } from '@/types/financial';
import LoadingSpinner from '@/components/LoadingSpinner';
import InvestmentForm from '@/components/investimentos/InvestmentForm';
import InvestmentCard from '@/components/investimentos/InvestmentCard';
import DistributionChart from '@/components/investimentos/DistributionChart';
import PerformanceChart from '@/components/investimentos/PerformanceChart';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Investimentos = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  
  const { 
    investments, 
    loading, 
    actionLoading, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment,
    updateCurrentAmount
  } = useInvestments();

  const workspaceInvestments = useMemo(() => {
    return investments.filter(i => i.workspace === currentWorkspace);
  }, [investments, currentWorkspace]);

  const summary = useMemo(() => {
    const totalInitial = workspaceInvestments.reduce((sum, i) => sum + i.initial_amount, 0);
    const totalCurrent = workspaceInvestments.reduce((sum, i) => sum + i.current_amount, 0);
    const profitLoss = totalCurrent - totalInitial;
    const totalReturn = totalInitial > 0 ? (profitLoss / totalInitial) * 100 : 0;

    return {
      totalInitial,
      totalCurrent,
      profitLoss,
      totalReturn
    };
  }, [workspaceInvestments]);

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleSubmit = async (investmentData: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'>) => {
    if (editingInvestment) {
      await updateInvestment(editingInvestment.id, investmentData);
    } else {
      await addInvestment(investmentData);
    }
    setShowForm(false);
    setEditingInvestment(undefined);
  };

  if (showForm) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowForm(true)}
      >
        <div className="p-4">
          <InvestmentForm
            investment={editingInvestment}
            workspace={currentWorkspace}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            loading={actionLoading}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={setCurrentWorkspace}
      onNewTransaction={() => setShowForm(true)}
    >
      <div className="space-y-6 p-4 lg:p-6">
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-5 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Carteira e performance
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  Investimentos e Carteira
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Visão consolidada dos ativos, rentabilidade e distribuição de capital com leitura executiva.
                </p>
              </div>
              <Button onClick={() => { setEditingInvestment(undefined); setShowForm(true); }} className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Novo Ativo
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <LoadingSpinner text="Carregando carteira..." />
        ) : (
          <>
            {/* Resumo da Carteira */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    Valor Atual da Carteira
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(summary.totalCurrent)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total investido: {formatCurrency(summary.totalInitial)}
                  </p>
                </CardContent>
              </Card>
              
              <Card variant="soft" className={summary.profitLoss >= 0 ? 'border-success/20' : 'border-error/20'}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-medium ${summary.profitLoss >= 0 ? 'text-success' : 'text-error'} flex items-center space-x-1`}>
                    <TrendingUp className="h-4 w-4" />
                    Lucro/Prejuízo Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary.profitLoss >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(summary.profitLoss)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rentabilidade total: {summary.totalReturn.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              
              <Card variant="soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary flex items-center space-x-1">
                    <Zap className="h-4 w-4" />
                    Total de Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {workspaceInvestments.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativos em {currentWorkspace}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DistributionChart investments={workspaceInvestments} />
              <PerformanceChart investments={workspaceInvestments} />
            </div>

            {/* Lista de Investimentos */}
            <h2 className="text-xl font-semibold mt-6 mb-4">Ativos na Carteira</h2>
            {workspaceInvestments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum investimento cadastrado para {currentWorkspace}.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {workspaceInvestments.map(investment => (
                  <InvestmentCard 
                    key={investment.id} 
                    investment={investment} 
                    onEdit={handleEdit} 
                    onDelete={deleteInvestment}
                    onUpdateAmount={updateCurrentAmount}
                    loading={actionLoading}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Investimentos;
