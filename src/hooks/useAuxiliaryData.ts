import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Client } from '@/types/financial';
import { useToastNotifications } from './useToastNotifications';
import { createCategory } from '@/data/financial'; // Mantendo a função de criação

// Converters (necessários para tipagem correta)
const convertToCategory = (data: any): Category => ({
  id: data.id,
  nome: data.nome,
  origem: data.origem as 'PF' | 'PJ',
  tipo: data.tipo as 'entrada' | 'saida',
  limite_mensal: data.limite_mensal ? parseFloat(data.limite_mensal) : undefined,
});

const convertToClient = (data: any): Client => ({
  id: data.id,
  nome: data.nome,
  tipo: data.tipo as 'recorrente' | 'avulso',
  ativo: data.ativo
});

export const useAuxiliaryData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // CARREGA CATEGORIES SEM FILTRO user_id (Contorno RLS)
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('nome');

      if (catError) throw catError;
      setCategories((catData || []).map(convertToCategory));

      // CARREGA RESPONSÁVEIS SEM FILTRO user_id (Contorno RLS)
      const { data: respData, error: respError } = await supabase
        .from('responsaveis')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (respError) throw respError;
      setClients((respData || []).map(convertToClient));

    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      // Não mostramos erro crítico aqui, pois o app pode funcionar sem eles
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setActionLoading(true);
      const newCategory = await createCategory(category);
      // Recarrega para garantir que o estado global seja atualizado
      await loadData(); 
      showSuccess('Categoria criada com sucesso!');
      return newCategory;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      showError('Erro ao criar categoria. Tente novamente.');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    categories,
    clients,
    loading,
    actionLoading,
    loadData,
    addCategory,
  };
};