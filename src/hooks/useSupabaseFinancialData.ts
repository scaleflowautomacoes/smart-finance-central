import { useState, useEffect, useCallback } from 'react';
import { DashboardMetrics } from '@/types/financial';
import { isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { useToastNotifications } from './useToastNotifications';
import { useTransactions } from './useTransactions';
import { useAuxiliaryData } from './useAuxiliaryData';
import { claimUnownedTransactions, generateRecurrences } from '@/data/financial';

// --- Funções de Cálculo (Mantidas) ---
const calculateMetrics = (
  transactions: any[], // Usamos any[] aqui para evitar dependência circular de tipos
  origem: 'PF' | 'PJ', 
  startDate?: Date, 
  endDate?: Date
): DashboardMetrics => {
  let filteredTransactions = transactions.filter(t => 
    t.origem === origem && 
    !t.deletado &&
    t.recorrencia_ativa !== false
  );
  
  const effectiveStartDate = startDate || startOfMonth(new Date());
  const effectiveEndDate = endDate || endOfMonth(new Date());
  
  filteredTransactions = filteredTransactions.filter(t => {
    const transactionDate = new Date(t.data);
    return isWithinInterval(transactionDate, { start: effectiveStartDate, end: effectiveEndDate });
  });
  
  const entradas = filteredTransactions.filter(t => t.tipo === 'entrada');
  const saidas = filteredTransactions.filter(t => t.tipo === 'saida');
  
  const entradasRealizadas = entradas
    .filter(t => t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saidasPagas = saidas
    .filter(t => t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const entradasPrevistas = entradas
    .filter(t => t.status === 'prevista' || t.status === 'vencida')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saidasPrevistas = saidas
    .filter(t => t.status === 'prevista' || t.status === 'vencida')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saldoReal = entradasRealizadas - saidasPagas;
  const saldoProjetado = (entradasPrevistas + entradasRealizadas) - (saidasPrevistas + saidasPagas);
  
  return {
    entradasPrevistas,
    entradasRealizadas,
    saidasPrevistas,
    saidasPagas,
    saldoProjetado,
    saldoReal
  };
};

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
    addCategory,
    refreshData,
    setDateFilter
  };
};