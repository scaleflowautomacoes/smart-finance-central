import { useState, useEffect, useCallback } from 'react';
import { useToastNotifications } from './useToastNotifications';
import { useTransactions } from './useTransactions';
import { useAuxiliaryData } from './useAuxiliaryData';
import { claimUnownedTransactions, generateRecurrences } from '@/data/financial';
import { calculateFinancialMetrics } from './useFinancialMetricsCore';

export const useSupabaseFinancialData = () => {
  const { showSuccess } = useToastNotifications();
  const { 
    transactions, 
    loading: transactionsLoading, 
    actionLoading: transactionActionLoading, 
    loadTransactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
    bulkCancelFutureRecurrences,
    setDateFilter
  } = useTransactions();
  
  const { 
    categories, 
    clients, 
    loading: auxiliaryLoading, 
    actionLoading: auxiliaryActionLoading, 
    loadData: loadAuxiliaryData, 
    addCategory 
  } = useAuxiliaryData();

  const [initialSetupComplete, setInitialSetupComplete] = useState(false);
  
  // O carregamento geral depende do carregamento dos dados e da conclusão do setup inicial
  const loading = transactionsLoading || auxiliaryLoading || !initialSetupComplete;
  const actionLoading = transactionActionLoading || auxiliaryActionLoading;

  const initialSetup = useCallback(async () => {
    try {
      console.log('Iniciando setup inicial (Claiming/Recurrences)...');
      
      // 1. Reivindicar transações sem user_id para o mock user
      const claimedCount = await claimUnownedTransactions();
      if (claimedCount > 0) {
        console.log(`${claimedCount} transações reivindicadas.`);
        showSuccess(`${claimedCount} transações antigas foram restauradas!`);
      }
      
      // 2. Garantir que as recorrências sejam geradas
      await generateRecurrences();
      
      // 3. Recarregar todos os dados após o setup (Isso garante que o estado seja atualizado)
      await Promise.all([loadTransactions(), loadAuxiliaryData()]);
      
    } catch (error) {
      console.error('Erro durante o setup inicial:', error);
    } finally {
      // Marca o setup como completo, independentemente de erros
      setInitialSetupComplete(true);
      console.log('Setup inicial concluído.');
    }
  }, [loadTransactions, loadAuxiliaryData, showSuccess]);

  useEffect(() => {
    if (!initialSetupComplete) {
        initialSetup();
    }
  }, [initialSetup, initialSetupComplete]);

  const refreshData = useCallback(async () => {
    await Promise.all([loadTransactions(), loadAuxiliaryData()]);
  }, [loadTransactions, loadAuxiliaryData]);

  return {
    transactions,
    categories,
    clients,
    loading,
    actionLoading,
    calculateMetrics,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
    bulkCancelFutureRecurrences,
    addCategory,
    refreshData,
    setDateFilter
  };
};
