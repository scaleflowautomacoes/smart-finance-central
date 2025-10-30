import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category, Responsavel } from "@/types/financial";
import { useToast } from "@/hooks/use-toast";
import { useMockUserId } from "./useMockUserId";

export const useSettings = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const userId = useMockUserId();

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('nome');

      if (error) {
        console.warn('Erro ao carregar categorias (continuando):', error);
        return [];
      }

      const typedCategories = (data || []).map(item => ({
        ...item,
        origem: item.origem as 'PF' | 'PJ',
        tipo: item.tipo as 'entrada' | 'saida'
      }));

      return typedCategories;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      return [];
    }
  };

  const loadResponsaveis = async () => {
    try {
      const { data, error } = await supabase
        .from('responsaveis')
        .select('*')
        .eq('user_id', userId)
        .order('nome');

      if (error) {
        console.warn('Erro ao carregar responsáveis (continuando):', error);
        return [];
      }

      const typedResponsaveis = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'recorrente' | 'avulso'
      }));

      return typedResponsaveis;
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error);
      return [];
    }
  };
  
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, responsaveisData] = await Promise.all([
        loadCategories(),
        loadResponsaveis()
      ]);
      
      setCategories(categoriesData);
      setResponsaveis(responsaveisData);
    } catch (e) {
      console.error("Erro no carregamento inicial de settings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    setActionLoading(true);
    try {
      const insertData = {
        ...category,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        origem: data.origem as 'PF' | 'PJ',
        tipo: data.tipo as 'entrada' | 'saida'
      };

      setCategories(prev => [...prev, typedData]);
      
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
      const updatePayload = { ...updates, user_id: userId }; // Incluir user_id no payload para garantir RLS
      
      const { data, error } = await supabase
        .from('categories')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        origem: data.origem as 'PF' | 'PJ',
        tipo: data.tipo as 'entrada' | 'saida'
      };

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
      const insertData = {
        ...responsavel,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('responsaveis')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        tipo: data.tipo as 'recorrente' | 'avulso'
      };

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
      const updatePayload = { ...updates, user_id: userId }; // Incluir user_id no payload para garantir RLS
      
      const { data, error } = await supabase
        .from('responsaveis')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        tipo: data.tipo as 'recorrente' | 'avulso'
      };

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