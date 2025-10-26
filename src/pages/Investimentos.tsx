import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Plus, TrendingUp, Zap } from 'lucide-react';
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
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <DollarSign className="h-7 w-7 text-primary" />
            <span>Investimentos e Carteira ({currentWorkspace})</span>
          </h1>
          <Button onClick={() => { setEditingInvestment(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Ativo
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner text="Carregando carteira..." />
        ) : (
          <>
            {/* Resumo da Carteira */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-blue-500 dark:bg-blue-900/20 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    Valor Atual da Carteira
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                    {formatCurrency(summary.totalCurrent)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total investido: {formatCurrency(summary.totalInitial)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className={`border-l-4 ${summary.profitLoss >= 0 ? 'border-l-success' : 'border-l-error'} dark:bg-green-900/20 dark:border-green-800`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-medium ${summary.profitLoss >= 0 ? 'text-success' : 'text-error'} flex items-center space-x-1`}>
                    <TrendingUp className="h-4 w-4" />
                    Lucro/Prejuízo Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary.profitLoss >= 0 ? 'text-success dark:text-green-300' : 'text-error dark:text-red-300'}`}>
                    {formatCurrency(summary.profitLoss)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rentabilidade total: {summary.totalReturn.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-purple-500 dark:bg-purple-900/20 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400 flex items-center space-x-1">
                    <Zap className="h-4 w-4" />
                    Total de Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
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