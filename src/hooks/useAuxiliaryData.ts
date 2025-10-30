import { useState, useEffect, useCallback } from 'react';
import { Category, Client } from '@/types/financial';
import { useToastNotifications } from './useToastNotifications';
import { fetchCategories, fetchClients, createCategory } from '@/data/financial';

export const useAuxiliaryData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesData, clientsData] = await Promise.all([
        fetchCategories(),
        fetchClients()
      ]);
      
      setCategories(categoriesData);
      setClients(clientsData);
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
      setCategories(prev => [...prev, newCategory]);
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