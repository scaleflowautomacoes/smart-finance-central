import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category, Client, DashboardMetrics } from '@/types/financial';
import { isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { useToastNotifications } from './useToastNotifications';
import { useMockUserId } from './useMockUserId'; // Importando o mock user ID

// Helper functions para converter dados do Supabase para nossos tipos
const convertToTransaction = (data: any): Transaction => {
  if (!data) {
    throw new Error('Dados da transação não encontrados');
  }
  
  return {
    id: data.id,
    nome: data.nome || '',
    tipo: data.tipo as 'entrada' | 'saida',
    valor: parseFloat(data.valor) || 0,
    data: data.data,
    origem: data.origem as 'PF' | 'PJ',
    forma_pagamento: data.forma_pagamento as 'pix' | 'boleto' | 'cartao' | 'dinheiro',
    status: data.status as 'prevista' | 'realizada' | 'vencida' | 'cancelada',
    cliente_id: data.cliente_id,
    categoria_id: data.categoria_id,
    subcategoria_id: data.subcategoria_id,
    dependencia: data.dependencia as 'Infoprodutos' | 'Chips' | 'Automações' | 'Disparos' | 'Co-produção' | undefined,
    recorrencia: data.recorrencia as 'Setup' | 'Fee Mensal' | 'Avulso' | undefined,
    observacoes: data.observacoes,
    deletado: data.deletado || false,
    is_recorrente: data.is_recorrente || false,
    recorrencia_tipo: data.recorrencia_tipo as 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | undefined,
    recorrencia_total_ocorrencias: data.recorrencia_total_ocorrencias,
    recorrencia_ocorrencia_atual: data.recorrencia_ocorrencia_atual,
    recorrencia_transacao_pai_id: data.recorrencia_transacao_pai_id,
    recorrencia_proxima_data: data.recorrencia_proxima_data,
    recorrencia_ativa: data.recorrencia_ativa !== false
  };
};

const convertToCategory = (data: any): Category => ({
  id: data.id,
  nome: data.nome,
  origem: data.origem as 'PF' | 'PJ',
  tipo: data.tipo as 'entrada' | 'saida',
  limite_mensal: data.limite_mensal
});

const convertToClient = (data: any): Client => ({
  id: data.id,
  nome: data.nome,
  tipo: data.tipo as 'recorrente' | 'avulso',
  ativo: data.ativo
});

export const useSupabaseFinancialData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { showSuccess, showError } = useToastNotifications();
  const userId = useMockUserId(); // Obtendo o user ID mockado

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadClients()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('deletado', false)
        .eq('user_id', userId) // Filtrar por user_id
        .order('data', { ascending: false });

      if (error) throw error;

      const convertedTransactions = (data || []).map(convertToTransaction);
      setTransactions(convertedTransactions);
    } catch (error) {
      showError('Erro ao carregar transações');
      throw error;
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId) // Filtrar por user_id
        .order('nome');

      if (error) {
        setCategories([]);
        return;
      }

      const convertedCategories = (data || []).map(convertToCategory);
      setCategories(convertedCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('responsaveis')
        .select('*')
        .eq('ativo', true)
        .eq('user_id', userId) // Filtrar por user_id
        .order('nome');

      if (error) {
        setClients([]);
        return;
      }

      const convertedClients = (data || []).map(convertToClient);
      setClients(convertedClients);
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error);
      setClients([]);
    }
  };

  const calculateMetrics = useCallback((origem: 'PF' | 'PJ', startDate?: Date, endDate?: Date): DashboardMetrics => {
    let filteredTransactions = transactions.filter(t => 
      t.origem === origem && 
      !t.deletado &&
      t.recorrencia_ativa !== false
    );
    
    const effectiveStartDate = startDate || startOfMonth(new Date());
    const effectiveEndDate = endDate || endOfMonth(new Date());
    
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.data);
      return isWithinInterval(transactionDate, { start: effectiveStartDate, end: effectiveEndDate });
    });
    
    const entradas = filteredTransactions.filter(t => t.tipo === 'entrada');
    const saidas = filteredTransactions.filter(t => t.tipo === 'saida');
    
    const entradasRealizadas = entradas
      .filter(t => t.status === 'realizada')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saidasPagas = saidas
      .filter(t => t.status === 'realizada')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const entradasPrevistas = entradas
      .filter(t => t.status === 'prevista' || t.status === 'vencida')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saidasPrevistas = saidas
      .filter(t => t.status === 'prevista' || t.status === 'vencida')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saldoReal = entradasRealizadas - saidasPagas;
    const saldoProjetado = (entradasPrevistas + entradasRealizadas) - (saidasPrevistas + saidasPagas);
    
    return {
      entradasPrevistas,
      entradasRealizadas,
      saidasPrevistas,
      saidasPagas,
      saldoProjetado,
      saldoReal
    };
  }, [transactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'deletado'>) => {
    try {
      setActionLoading(true);
      
      if (!transaction.nome || !transaction.tipo || !transaction.valor || !transaction.data) {
        throw new Error('Dados obrigatórios não informados');
      }

      const insertData = {
        nome: transaction.nome,
        tipo: transaction.tipo,
        valor: transaction.valor,
        data: transaction.data,
        origem: transaction.origem,
        forma_pagamento: transaction.forma_pagamento,
        status: transaction.status,
        cliente_id: transaction.cliente_id || null,
        categoria_id: transaction.categoria_id || null,
        subcategoria_id: transaction.subcategoria_id || null,
        dependencia: transaction.dependencia || null,
        recorrencia: transaction.recorrencia || null,
        observacoes: transaction.observacoes || null,
        is_recorrente: transaction.is_recorrente || false,
        recorrencia_tipo: transaction.recorrencia_tipo || null,
        recorrencia_total_ocorrencias: transaction.recorrencia_total_ocorrencias || null,
        recorrencia_ocorrencia_atual: transaction.recorrencia_ocorrencia_atual || null,
        recorrencia_transacao_pai_id: transaction.recorrencia_transacao_pai_id || null,
        recorrencia_proxima_data: transaction.recorrencia_proxima_data || null,
        recorrencia_ativa: transaction.recorrencia_ativa !== false ? true : false,
        deletado: false,
        user_id: userId // Adicionando o user_id
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      await loadTransactions();
      
      if (transaction.is_recorrente && transaction.recorrencia_total_ocorrencias && transaction.recorrencia_total_ocorrencias > 1) {
        try {
          const { error: rpcError } = await supabase.rpc('gerar_proximas_transacoes_recorrentes');
          if (rpcError) {
            console.warn('Erro ao gerar transações recorrentes:', rpcError);
          }
          
          setTimeout(async () => {
            await loadTransactions();
          }, 1000);
          
          showSuccess(`Transação recorrente criada! ${transaction.recorrencia_total_ocorrencias} transações foram programadas.`);
        } catch (error) {
          console.warn('Erro ao processar recorrência:', error);
          showSuccess('Transação criada com sucesso!');
        }
      } else {
        showSuccess('Transação adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      showError('Erro ao adicionar transação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setActionLoading(true);
      
      const updateData = {
        ...updates,
        cliente_id: updates.cliente_id || null,
        categoria_id: updates.categoria_id || null,
        subcategoria_id: updates.subcategoria_id || null,
        dependencia: updates.dependencia || null,
        recorrencia: updates.recorrencia || null,
        observacoes: updates.observacoes || null,
        recorrencia_tipo: updates.recorrencia_tipo || null,
        recorrencia_total_ocorrencias: updates.recorrencia_total_ocorrencias || null,
        recorrencia_transacao_pai_id: updates.recorrencia_transacao_pai_id || null,
        recorrencia_proxima_data: updates.recorrencia_proxima_data || null
      };
      
      const previousTransactions = transactions;
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId); // Garantir que só atualiza a própria transação

      if (error) {
        setTransactions(previousTransactions);
        throw error;
      }

      showSuccess('Transação atualizada com sucesso!');
      
      setTimeout(async () => {
        await loadTransactions();
      }, 500);
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
      
      const previousTransactions = transactions;
      setTransactions(prev => prev.filter(t => t.id !== id));

      const { error } = await supabase
        .from('transactions')
        .update({ deletado: true })
        .eq('id', id)
        .eq('user_id', userId); // Garantir que só deleta a própria transação

      if (error) {
        setTransactions(previousTransactions);
        throw error;
      }

      showSuccess('Transação excluída com sucesso!');
      
      setTimeout(async () => {
        await loadTransactions();
      }, 500);
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      showError('Erro ao excluir transação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setActionLoading(true);

      const insertData = {
        ...category,
        user_id: userId // Adicionando o user_id
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const convertedCategory = convertToCategory(data);
      setCategories(prev => [...prev, convertedCategory]);
      showSuccess('Categoria criada com sucesso!');
      
      return convertedCategory;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      showError('Erro ao criar categoria. Tente novamente.');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  return {
    transactions,
    categories,
    clients,
    loading,
    actionLoading,
    calculateMetrics,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    refreshData
  };
};