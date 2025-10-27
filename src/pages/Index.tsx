import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import TransactionTable from '@/components/TransactionTable';
import TransactionForm from '@/components/TransactionForm';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import { Transaction } from '@/types/financial';
import { PeriodType } from '@/components/PeriodFilter';
import { startOfMonth, endOfMonth } from 'date-fns';

// Funções de inicialização para garantir que o estado seja lido apenas uma vez
const getInitialWorkspace = (): 'PF' | 'PJ' => {
  const saved = localStorage.getItem('financial-workspace');
  return (saved as 'PF' | 'PJ') || 'PF';
};

const getInitialPeriodFilter = () => {
  const saved = localStorage.getItem('financial-period');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        startDate: parsed.startDate ? new Date(parsed.startDate) : startOfMonth(new Date()),
        endDate: parsed.endDate ? new Date(parsed.endDate) : endOfMonth(new Date())
      };
    } catch (e) {
      console.error("Failed to parse financial-period from localStorage", e);
    }
  }
  return {
    type: 'current' as PeriodType,
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  };
};

const Index = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>(getInitialWorkspace);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [periodFilter, setPeriodFilter] = useState(getInitialPeriodFilter);

  const {
    transactions,
    categories,
    clients,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    refreshData
  } = useSupabaseFinancialData();

  // Efeitos para persistir o estado no localStorage
  useEffect(() => {
    localStorage.setItem('financial-workspace', currentWorkspace);
  }, [currentWorkspace]);

  useEffect(() => {
    // Salva apenas strings serializáveis
    localStorage.setItem('financial-period', JSON.stringify({
      type: periodFilter.type,
      startDate: periodFilter.startDate?.toISOString(),
      endDate: periodFilter.endDate?.toISOString(),
    }));
  }, [periodFilter]);

  const handlePeriodChange = useCallback((period: PeriodType, startDate?: Date, endDate?: Date) => {
    if (startDate && endDate) {
      setPeriodFilter({
        type: period,
        startDate,
        endDate
      });
    }
  }, []);

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
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      
      // Forçar refresh dos dados após salvar
      await refreshData();
      
      setShowForm(false);
      setEditingTransaction(undefined);
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
        onNewTransaction={handleNewTransaction}
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
        onNewTransaction={handleNewTransaction}
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
      onNewTransaction={handleNewTransaction}
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
          onEdit={handleEditTransaction}
          onDelete={deleteTransaction}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Index;