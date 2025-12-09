import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types/financial';
import { useToastNotifications } from './useToastNotifications';
import { 
  fetchTransactions, 
  createTransaction, 
  updateTransaction as updateTransactionApi, 
  softDeleteTransaction, 
  generateRecurrences 
} from '@/data/financial';
import { supabase } from '@/integrations/supabase/client';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ startDate?: Date; endDate?: Date }>({});
  const { showSuccess, showError } = useToastNotifications();

  const loadTransactions = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const data = await fetchTransactions(startDate, endDate);
      setTransactions(data);
      return data;
    } catch (error) {
      showError('Erro ao carregar transações');
      console.error('Falha crítica ao carregar transações:', error);
      setTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadTransactions(dateFilter.startDate, dateFilter.endDate);
    
    // Realtime subscription
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          console.log('Realtime update received. Reloading transactions...');
          loadTransactions(dateFilter.startDate, dateFilter.endDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTransactions, dateFilter]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'deletado'>) => {
    try {
      setActionLoading(true);
      
      const newTransaction = await createTransaction(transaction);
      
      if (newTransaction.is_recorrente && newTransaction.recorrencia_total_ocorrencias && newTransaction.recorrencia_total_ocorrencias > 1) {
        await generateRecurrences();
        showSuccess(`Transação recorrente criada! ${newTransaction.recorrencia_total_ocorrencias} transações foram programadas.`);
      } else {
        showSuccess('Transação criada com sucesso!');
      }
      
      // Recarrega após a criação e possível geração de recorrências
      await loadTransactions(dateFilter.startDate, dateFilter.endDate);
      return newTransaction;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      showError('Erro ao adicionar transação. Tente novamente.');
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setActionLoading(true);
      await updateTransactionApi(id, updates);
      showSuccess('Transação atualizada com sucesso!');
      await loadTransactions(dateFilter.startDate, dateFilter.endDate);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      showError('Erro ao atualizar transação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setActionLoading(true);
      await softDeleteTransaction(id);
      showSuccess('Transação excluída com sucesso!');
      await loadTransactions(dateFilter.startDate, dateFilter.endDate);
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      showError('Erro ao excluir transação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    transactions,
    loading,
    actionLoading,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setDateFilter: (startDate: Date, endDate: Date) => setDateFilter({ startDate, endDate }),
  };
};