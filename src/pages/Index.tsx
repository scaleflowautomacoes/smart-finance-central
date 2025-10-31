import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import TransactionTable from '@/components/TransactionTable';
import TransactionForm from '@/components/TransactionForm';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import { Transaction } from '@/types/financial';
import { DateRangeState, PresetName } from '@/components/DateRangeFilter';
import { startOfMonth, endOfMonth } from 'date-fns';
import LoadingSpinner from '@/components/LoadingSpinner';

const Index = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>(() => {
    const saved = localStorage.getItem('financial-workspace');
    return (saved as 'PF' | 'PJ') || 'PF';
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  
  const [dateRange, setDateRange] = useState<DateRangeState>(() => {
    const now = new Date();
    const defaultRange: DateRangeState = {
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
      presetName: 'este-mes'
    };
    
    const saved = localStorage.getItem('financial-date-range');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          startDate: parsed.startDate ? new Date(parsed.startDate) : defaultRange.startDate,
          endDate: parsed.endDate ? new Date(parsed.endDate) : defaultRange.endDate,
          presetName: parsed.presetName || 'este-mes'
        };
      } catch (e) {
        console.error("Failed to parse financial-date-range from localStorage", e);
        return defaultRange;
      }
    }
    return defaultRange;
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
    refreshData,
    setDateFilter
  } = useSupabaseFinancialData();

  // DEBUG LOG: Verificar se as transações estão sendo carregadas
  useEffect(() => {
    if (!loading) {
      console.log(`[Index] Transações carregadas: ${transactions.length}`);
    }
  }, [loading, transactions]);

  useEffect(() => {
    localStorage.setItem('financial-workspace', currentWorkspace);
  }, [currentWorkspace]);

  // Aplicar filtro de datas ao carregar transações
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      setDateFilter(dateRange.startDate, dateRange.endDate);
    }
  }, [dateRange, setDateFilter]);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('financial-date-range', JSON.stringify({
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
      presetName: dateRange.presetName
    }));
  }, [dateRange]);

  const handleRangeChange = (start: Date, end: Date, presetName: PresetName) => {
    setDateRange({ startDate: start, endDate: end, presetName });
  };

  const handleClearFilter = () => {
    const now = new Date();
    setDateRange({
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
      presetName: 'este-mes'
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
  
  if (loading) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowForm(true)}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner text="Carregando transações do Supabase..." />
        </div>
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
          dateRange={dateRange}
          onRangeChange={handleRangeChange}
          onClearFilter={handleClearFilter}
          loading={loading}
          onRefreshData={refreshData}
          onNewTransaction={handleNewTransaction}
        />
        
        <TransactionTable
          transactions={transactions}
          workspace={currentWorkspace}
          dateRange={dateRange}
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