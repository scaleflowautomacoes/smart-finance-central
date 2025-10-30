import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from './useToastNotifications';

export interface FutureProjection {
  id: string;
  nome: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  data: string;
  origem: 'PF' | 'PJ';
  projected: boolean;
}

export const useFutureProjections = () => {
  const [projections, setProjections] = useState<FutureProjection[]>([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useToastNotifications();

  const loadProjections = useCallback(async (days = 90) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('project_future_transactions', { days_ahead: days });
      
      if (error) throw error;
      
      const filteredData = (data || [])
        .filter(p => p.tipo && p.nome && p.origem)
        .map(p => ({
          ...p,
          valor: parseFloat(p.valor),
          tipo: p.tipo as 'entrada' | 'saida',
          origem: p.origem as 'PF' | 'PJ',
        }));
      
      setProjections(filteredData as FutureProjection[] || []);
    } catch (error) {
      console.error('Erro projeção:', error);
      showError('Erro ao carregar projeções futuras.');
      setProjections([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { projections, loading, loadProjections };
};