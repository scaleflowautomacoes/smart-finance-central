import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Debt } from '@/types/financial';
import { useToastNotifications } from './useToastNotifications';
import { useMockUserId } from './useMockUserId';

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const userId = useMockUserId();

  const loadDebts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const convertedDebts: Debt[] = (data || []).map(d => ({
        ...d,
        total_amount: parseFloat(d.total_amount?.toString() || '0'),
        remaining_amount: parseFloat(d.remaining_amount?.toString() || '0'),
        interest_rate: parseFloat(d.interest_rate?.toString() || '0'),
        installments_total: parseInt(d.installments_total?.toString() || '0'),
        installments_paid: parseInt(d.installments_paid?.toString() || '0'),
        payment_day: parseInt(d.payment_day?.toString() || '1'),
        status: d.status as 'active' | 'paid' | 'late',
        workspace: d.workspace as 'PF' | 'PJ',
      }));
      
      setDebts(convertedDebts);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
      showError('Erro ao carregar dívidas.');
      setDebts([]);
    } finally {
      setLoading(false);
    }
  }, [showError, userId]);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const addDebt = async (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'remaining_amount' | 'installments_paid'>) => {
    setActionLoading(true);
    try {
      // Simular cálculo de remaining_amount e installments_paid
      const insertData = {
        ...debt,
        remaining_amount: debt.total_amount,
        installments_paid: 0,
        user_id: userId,
      };

      const { error } = await supabase
        .from('debts')
        .insert([insertData]);

      if (error) throw error;

      showSuccess('Dívida cadastrada com sucesso!');
      await loadDebts();
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
      showError('Erro ao adicionar dívida.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      showSuccess('Dívida atualizada com sucesso!');
      await loadDebts();
    } catch (error) {
      console.error('Erro ao atualizar dívida:', error);
      showError('Erro ao atualizar dívida.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteDebt = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      showSuccess('Dívida excluída com sucesso!');
      await loadDebts();
    } catch (error) {
      console.error('Erro ao excluir dívida:', error);
      showError('Erro ao excluir dívida.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Função para simular o pagamento de uma parcela
  const payInstallment = async (debt: Debt) => {
    if (debt.installments_paid >= debt.installments_total) {
      showError('Todas as parcelas já foram pagas.');
      return false;
    }
    
    setActionLoading(true);
    try {
      // Simplificação: assumimos que o pagamento reduz o saldo pelo valor da parcela (ignorando juros compostos na simulação visual)
      const installmentValue = debt.total_amount / debt.installments_total;
      
      const newRemaining = Math.max(0, debt.remaining_amount - installmentValue);
      const newPaid = debt.installments_paid + 1;
      const newStatus = newPaid >= debt.installments_total ? 'paid' : 'active';
      
      // Calcular a próxima data de vencimento (adicionar 1 mês à data de vencimento atual)
      const currentDueDate = new Date(debt.due_date);
      const nextDueDate = new Date(currentDueDate.setMonth(currentDueDate.getMonth() + 1));
      
      const { error } = await supabase
        .from('debts')
        .update({
          remaining_amount: newRemaining,
          installments_paid: newPaid,
          status: newStatus,
          due_date: newStatus === 'active' ? nextDueDate.toISOString().split('T')[0] : debt.due_date
        })
        .eq('id', debt.id)
        .eq('user_id', userId);

      if (error) throw error;

      showSuccess(`Parcela ${newPaid}/${debt.installments_total} paga!`);
      await loadDebts();
      return true;
    } catch (error) {
      console.error('Erro ao pagar parcela:', error);
      showError('Erro ao registrar pagamento.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    debts,
    loading,
    actionLoading,
    loadDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    payInstallment
  };
};