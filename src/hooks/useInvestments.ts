import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Investment } from '@/types/financial';
import { useToastNotifications } from './useToastNotifications';

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  const loadInvestments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;

      const convertedInvestments: Investment[] = (data || []).map(i => ({
        ...i,
        initial_amount: parseFloat(i.initial_amount),
        current_amount: parseFloat(i.current_amount),
        expected_return: parseFloat(i.expected_return),
        type: i.type as Investment['type'],
        status: i.status as Investment['status'],
        workspace: i.workspace as 'PF' | 'PJ',
      }));
      
      setInvestments(convertedInvestments);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      showError('Erro ao carregar investimentos.');
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'>) => {
    setActionLoading(true);
    try {
      const insertData = { 
        ...investment, 
        current_amount: investment.initial_amount, // Inicialmente, o valor atual é o inicial
        status: 'active',
        user_id: 'mock_user_id',
      };

      const { error } = await supabase
        .from('investments')
        .insert([insertData]);

      if (error) throw error;

      showSuccess('Investimento cadastrado com sucesso!');
      await loadInvestments();
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      showError('Erro ao adicionar investimento.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      showSuccess('Investimento atualizado com sucesso!');
      await loadInvestments();
    } catch (error) {
      showError('Erro ao atualizar investimento.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const deleteInvestment = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showSuccess('Investimento excluído com sucesso!');
      await loadInvestments();
    } catch (error) {
      showError('Erro ao excluir investimento.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const updateCurrentAmount = async (id: string, newAmount: number) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('investments')
        .update({ current_amount: newAmount })
        .eq('id', id);

      if (error) throw error;

      showSuccess('Valor atualizado com sucesso!');
      await loadInvestments();
    } catch (error) {
      showError('Erro ao atualizar valor.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    investments,
    loading,
    actionLoading,
    loadInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    updateCurrentAmount
  };
};