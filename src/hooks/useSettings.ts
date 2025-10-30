import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category, Responsavel, TablesInsert, TablesUpdate } from "@/types/financial";
import { useToast } from "@/hooks/use-toast";
import { useMockUserId } from "./useMockUserId";
import { createCategory } from "@/data/financial"; // Importando funções de acesso a dados
import { fetchCategories, fetchClients } from "./useAuxiliaryData"; // Importando funções de carregamento sem filtro user_id

// Converters (necessários para tipagem correta)
const convertToCategory = (data: any): Category => ({
  id: data.id,
  nome: data.nome,
  origem: data.origem as 'PF' | 'PJ',
  tipo: data.tipo as 'entrada' | 'saida',
  limite_mensal: data.limite_mensal ? parseFloat(data.limite_mensal) : undefined,
});

const convertToResponsavel = (data: any): Responsavel => ({
  id: data.id,
  nome: data.nome,
  tipo: data.tipo as 'recorrente' | 'avulso',
  ativo: data.ativo
});


export const useSettings = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const userId = useMockUserId();

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // Carregamento sem filtro user_id (Contorno RLS)
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('nome');
        
      const { data: respData } = await supabase
        .from('responsaveis')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      setCategories((catData || []).map(convertToCategory));
      setResponsaveis((respData || []).map(convertToResponsavel));
      
    } catch (e) {
      console.error("Erro no carregamento inicial de settings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    setActionLoading(true);
    try {
      const newCategory = await createCategory(category);
      setCategories(prev => [...prev, newCategory]);
      
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso!",
      });
      
      await loadInitialData();
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar categoria",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setActionLoading(true);
    try {
      const updatePayload: TablesUpdate<'categories'> = { ...updates, user_id: userId };
      
      const { data, error } = await supabase
        .from('categories')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const typedData = convertToCategory(data);

      setCategories(prev => prev.map(cat => cat.id === id ? typedData : cat));
      
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar categoria",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const addResponsavel = async (responsavel: Omit<Responsavel, 'id'>) => {
    setActionLoading(true);
    try {
      const insertData: TablesInsert<'responsaveis'> = {
        ...responsavel,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('responsaveis')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      const typedData = convertToResponsavel(data);

      setResponsaveis(prev => [...prev, typedData]);
      
      toast({
        title: "Sucesso",
        description: "Responsável adicionado com sucesso!",
      });
      
      await loadInitialData();
    } catch (error) {
      console.error('Erro ao adicionar responsável:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar responsável",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateResponsavel = async (id: string, updates: Partial<Responsavel>) => {
    setActionLoading(true);
    try {
      const updatePayload: TablesUpdate<'responsaveis'> = { ...updates, user_id: userId };
      
      const { data, error } = await supabase
        .from('responsaveis')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const typedData = convertToResponsavel(data);

      setResponsaveis(prev => prev.map(resp => resp.id === id ? typedData : resp));
      
      toast({
        title: "Sucesso",
        description: "Responsável atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar responsável",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteResponsavel = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('responsaveis')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setResponsaveis(prev => prev.filter(resp => resp.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Responsável removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar responsável:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar responsável",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    categories,
    responsaveis,
    loading,
    actionLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    addResponsavel,
    updateResponsavel,
    deleteResponsavel,
    refreshData
  };
};