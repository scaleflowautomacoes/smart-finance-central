import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Plus, DollarSign, Calendar, AlertTriangle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebts } from '@/hooks/useDebts';
import { Debt } from '@/types/financial';
import DebtForm from '@/components/dividas/DebtForm';
import DebtCard from '@/components/dividas/DebtCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PaymentTimeline from '@/components/dividas/PaymentTimeline';
import DebtChart from '@/components/dividas/DebtChart';
import DebtSimulator from '@/components/dividas/DebtSimulator'; // Importando o simulador

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Dividas = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  
  const { debts, loading, actionLoading, addDebt, updateDebt, deleteDebt, payInstallment } = useDebts();

  const workspaceDebts = useMemo(() => {
    return debts.filter(d => d.workspace === currentWorkspace);
  }, [debts, currentWorkspace]);

  const summary = useMemo(() => {
    const totalAmount = workspaceDebts.reduce((sum, d) => sum + d.total_amount, 0);
    const remainingAmount = workspaceDebts.reduce((sum, d) => sum + d.remaining_amount, 0);
    const lateDebts = workspaceDebts.filter(d => d.status === 'late');
    
    const nextDueDate = workspaceDebts
      .filter(d => d.status === 'active')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

    return {
      totalAmount,
      remainingAmount,
      lateCount: lateDebts.length,
      nextDueDate: nextDueDate ? format(new Date(nextDueDate.due_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
      nextDueAmount: nextDueDate ? (nextDueDate.total_amount / nextDueDate.installments_total) : 0
    };
  }, [workspaceDebts]);

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
    setShowDetails(false); // Fechar detalhes se estiver aberto
  };
  
  const handleDetails = (debt: Debt) => {
    setEditingDebt(debt);
    setShowDetails(true);
  };

  const handlePayInstallment = async (debt: Debt) => {
    await payInstallment(debt);
  };

  const handleSubmit = async (debtData: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'remaining_amount' | 'installments_paid'>) => {
    if (editingDebt && !editingDebt.created_at) {
      // Se estiver editando, mas for um objeto temporário (duplicação), trate como adição
      await addDebt(debtData);
    } else if (editingDebt) {
      await updateDebt(editingDebt.id, debtData);
    } else {
      await addDebt(debtData);
    }
    setShowForm(false);
    setEditingDebt(undefined);
  };

  if (showForm) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowForm(true)}
      >
        <div className="p-4">
          <DebtForm
            debt={editingDebt}
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
            <Scale className="h-7 w-7 text-primary" />
            <span>Dívidas ({currentWorkspace})</span>
          </h1>
          <Button onClick={() => { setEditingDebt(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Dívida
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner text="Carregando dívidas..." />
        ) : (
          <>
            {/* Simulador de Quitação */}
            <DebtSimulator />
            
            {/* Resumo das Dívidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    Total Devido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                    {formatCurrency(summary.remainingAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    De um total de {formatCurrency(summary.totalAmount)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400 flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    Próximo Vencimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                    {summary.nextDueDate}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor estimado: {formatCurrency(summary.nextDueAmount)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className={`${summary.lateCount > 0 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-medium ${summary.lateCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'} flex items-center space-x-1`}>
                    <AlertTriangle className="h-4 w-4" />
                    Dívidas Atrasadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary.lateCount > 0 ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                    {summary.lateCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary.lateCount > 0 ? 'Ação Imediata Necessária' : 'Nenhuma dívida atrasada'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Dívidas */}
            <h2 className="text-xl font-semibold mt-6 mb-4">Dívidas Ativas</h2>
            {workspaceDebts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma dívida cadastrada para {currentWorkspace}.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {workspaceDebts.map(debt => (
                  <DebtCard 
                    key={debt.id} 
                    debt={debt} 
                    onEdit={handleDetails} // Abrir detalhes/editar
                    onPayInstallment={handlePayInstallment}
                    loading={actionLoading}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de Detalhes e Edição */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Detalhes da Dívida: {editingDebt?.name}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEdit(editingDebt!)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTitle>
          </DialogHeader>
          {editingDebt && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentTimeline debt={editingDebt} />
                <DebtChart debt={editingDebt} />
              </div>
              {/* Adicionar opção de exclusão aqui se necessário */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dividas;