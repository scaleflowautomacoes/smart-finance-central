import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import TransactionTable from '@/components/TransactionTable';
import TransactionForm from '@/components/TransactionForm';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import { Transaction } from '@/types/financial';
import { PeriodType } from '@/components/PeriodFilter';
import { startOfMonth, endOfMonth } from 'date-fns';

const Index = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>(() => {
    const saved = localStorage.getItem('financial-workspace');
    return (saved as 'PF' | 'PJ') || 'PF';
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  
  const [periodFilter, setPeriodFilter] = useState<{
    type: PeriodType;
    startDate?: Date;
    endDate?: Date;
  }>(() => {
    const now = new Date();
    const defaultPeriod = {
      type: 'current' as PeriodType,
      startDate: startOfMonth(now),
      endDate: endOfMonth(now)
    };
    
    const saved = localStorage.getItem('financial-period');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          startDate: parsed.startDate ? new Date(parsed.startDate) : defaultPeriod.startDate,
          endDate: parsed.endDate ? new Date(parsed.endDate) : defaultPeriod.endDate
        };
      } catch (e) {
        console.error("Failed to parse financial-period from localStorage", e);
        return defaultPeriod;
      }
    }
    return defaultPeriod;
  });

  const {
    transactions,
    categories,
    clients,
    loading,
    actionLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    refreshData
  } = useSupabaseFinancialData();

  useEffect(() => {
    localStorage.setItem('financial-workspace', currentWorkspace);
  }, [currentWorkspace]);

  useEffect(() => {
    // Salva apenas strings de data para evitar problemas de desserialização
    localStorage.setItem('financial-period', JSON.stringify({
      type: periodFilter.type,
      startDate: periodFilter.startDate?.toISOString(),
      endDate: periodFilter.endDate?.toISOString()
    }));
  }, [periodFilter]);

  const handlePeriodChange = (period: PeriodType, startDate?: Date, endDate?: Date) => {
    setPeriodFilter({
      type: period,
      startDate,
      endDate
    });
  };

  const handleNewTransaction = () => {
    setEditingTransaction(undefined);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleSubmitTransaction = async (transactionData: Omit<Transaction, 'id' | 'deletado'>) => {
    try {
      console.log('🎯 Index.tsx - Recebendo dados da transação:', transactionData);
      
      if (editingTransaction) {
        console.log('✏️ Atualizando transação existente:', editingTransaction.id);
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        console.log('➕ Criando nova transação');
        await addTransaction(transactionData);
      }
      
      // Forçar refresh dos dados após salvar
      console.log('🔄 Forçando refresh dos dados...');
      await refreshData();
      
      setShowForm(false);
      setEditingTransaction(undefined);
      
      console.log('✅ Transação processada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar transação no Index.tsx:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  if (loading) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowForm(true)}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <div className="text-sm text-muted-foreground">Carregando dados...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (showForm) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowForm(true)}
      >
        <TransactionForm
          transaction={editingTransaction}
          workspace={currentWorkspace}
          categories={categories}
          clients={clients}
          onSubmit={handleSubmitTransaction}
          onCancel={handleCancelForm}
          onAddCategory={addCategory}
        />
      </Layout>
    );
  }

  return (
    <Layout
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={setCurrentWorkspace}
      onNewTransaction={() => setShowForm(true)}
    >
      <div className="space-y-4 lg:space-y-8">
        <Dashboard 
          workspace={currentWorkspace}
          transactions={transactions}
          categories={categories}
          onPeriodChange={handlePeriodChange}
          periodFilter={periodFilter}
          loading={loading}
          onRefreshData={refreshData}
        />
        
        <TransactionTable
          transactions={transactions}
          workspace={currentWorkspace}
          periodFilter={periodFilter}
          onEdit={(transaction: Transaction) => {
            setEditingTransaction(transaction);
            setShowForm(true);
          }}
          onDelete={deleteTransaction}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Index;