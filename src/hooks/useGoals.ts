import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types/financial';
import { useToastNotifications } from './useToastNotifications';
import { useMockUserId } from './useMockUserId';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const userId = useMockUserId();

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true });

      if (error) throw error;

      const convertedGoals: Goal[] = (data || []).map(g => ({
        ...g,
        target_amount: typeof g.target_amount === 'string' ? parseFloat(g.target_amount) : g.target_amount,
        current_amount: typeof g.current_amount === 'string' ? parseFloat(g.current_amount) : g.current_amount,
        status: g.status as 'active' | 'completed' | 'cancelled',
        type: g.type as 'saving' | 'revenue' | 'expense_reduction',
        workspace: g.workspace as 'PF' | 'PJ',
      }));
      
      setGoals(convertedGoals);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      showError('Erro ao carregar metas.');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [showError, userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'>) => {
    setActionLoading(true);
    try {
      const insertData = {
        ...goal,
        current_amount: 0, // Começa em zero
        status: 'active',
        user_id: userId,
      };

      const { error } = await supabase
        .from('goals')
        .insert([insertData]);

      if (error) throw error;

      showSuccess('Meta cadastrada com sucesso!');
      await loadGoals();
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      showError('Erro ao adicionar meta.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      showSuccess('Meta atualizada com sucesso!');
      await loadGoals();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      showError('Erro ao atualizar meta.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const deleteGoal = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      showSuccess('Meta excluída com sucesso!');
      await loadGoals();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      showError('Erro ao excluir meta.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const addContribution = async (id: string, amount: number) => {
    setActionLoading(true);
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) throw new Error('Meta não encontrada');
      
      const newAmount = goal.current_amount + amount;
      const newStatus = newAmount >= goal.target_amount ? 'completed' : 'active';
      
      const { error } = await supabase
        .from('goals')
        .update({
          current_amount: newAmount,
          status: newStatus,
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      showSuccess(`Contribuição de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)} adicionada!`);
      await loadGoals();
    } catch (error) {
      console.error('Erro ao adicionar contribuição:', error);
      showError('Erro ao adicionar contribuição.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    goals,
    loading,
    actionLoading,
    loadGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution
  };
};