
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from './useToastNotifications';

export const useRecurrenceManager = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  const manageRecurrence = async (transactionId: string, action: 'pausar' | 'reativar' | 'cancelar') => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('gerenciar_recorrencia', {
        p_transacao_pai_id: transactionId,
        p_acao: action
      });

      if (error) {
        throw error;
      }

      const actionMessages = {
        pausar: 'Recorrência pausada com sucesso!',
        reativar: 'Recorrência reativada com sucesso!',
        cancelar: 'Recorrência cancelada com sucesso!'
      };

      showSuccess(actionMessages[action]);
      return true;
    } catch (error) {
      console.error('Erro ao gerenciar recorrência:', error);
      showError('Erro ao gerenciar recorrência. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    manageRecurrence,
    loading
  };
};
