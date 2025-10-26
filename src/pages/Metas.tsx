import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, DollarSign, Clock, CheckCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/hooks/useGoals';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import { Goal } from '@/types/financial';
import LoadingSpinner from '@/components/LoadingSpinner';
import GoalForm from '@/components/metas/GoalForm';
import GoalCard from '@/components/metas/GoalCard';
import ContributionHistory from '@/components/metas/ContributionHistory';
import { differenceInDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Metas = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  
  const { goals, loading, actionLoading, addGoal, updateGoal, deleteGoal, addContribution } = useGoals();
  const { categories } = useSupabaseFinancialData();

  const workspaceGoals = useMemo(() => {
    return goals.filter(g => g.workspace === currentWorkspace);
  }, [goals, currentWorkspace]);

  const summary = useMemo(() => {
    const totalTarget = workspaceGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrent = workspaceGoals.reduce((sum, g) => sum + g.current_amount, 0);
    const activeGoals = workspaceGoals.filter(g => g.status === 'active');
    const completedGoals = workspaceGoals.filter(g => g.status === 'completed');
    
    const nextDeadline = activeGoals
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

    return {
      totalTarget,
      totalCurrent,
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      nextDeadline: nextDeadline ? differenceInDays(new Date(nextDeadline.deadline), new Date()) : 'N/A',
    };
  }, [workspaceGoals]);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
    setShowDetails(false);
  };
  
  const handleDetails = (goal: Goal) => {
    setEditingGoal(goal);
    setShowDetails(true);
  };

  const handleSubmit = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'>) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, goalData);
    } else {
      await addGoal(goalData);
    }
    setShowForm(false);
    setEditingGoal(undefined);
  };

  if (showForm) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowForm(true)}
      >
        <div className="p-4">
          <GoalForm
            goal={editingGoal}
            workspace={currentWorkspace}
            categories={categories}
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
            <Target className="h-7 w-7 text-primary" />
            <span>Metas Financeiras ({currentWorkspace})</span>
          </h1>
          <Button onClick={() => { setEditingGoal(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner text="Carregando metas..." />
        ) : (
          <>
            {/* Resumo das Metas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    Progresso Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                    {formatCurrency(summary.totalCurrent)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    De um objetivo total de {formatCurrency(summary.totalTarget)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400 flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    Metas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                    {summary.activeCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Próximo prazo em {summary.nextDeadline} dias
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    Metas Concluídas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                    {summary.completedCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Parabéns pelo progresso!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Metas */}
            <h2 className="text-xl font-semibold mt-6 mb-4">Metas Ativas e Pendentes</h2>
            {workspaceGoals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma meta cadastrada para {currentWorkspace}.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {workspaceGoals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onEdit={handleDetails} // Abrir detalhes/editar
                    onDelete={deleteGoal}
                    onAddContribution={addContribution}
                    loading={actionLoading}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de Detalhes e Histórico */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Detalhes da Meta: {editingGoal?.name}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEdit(editingGoal!)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-6">
              <GoalCard 
                goal={editingGoal} 
                onEdit={handleEdit} 
                onDelete={deleteGoal}
                onAddContribution={addContribution}
                loading={actionLoading}
              />
              <ContributionHistory goal={editingGoal} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Metas;