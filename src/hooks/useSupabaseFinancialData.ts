import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category, Client, DashboardMetrics } from '@/types/financial';
import { isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useToastNotifications } from './useToastNotifications';
import { useMockUserId } from './useMockUserId'; // Importando o mock user ID

// --- SEED DATA (Dados Iniciais) ---
const SEED_TRANSACTIONS: Omit<Transaction, 'id' | 'deletado' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  // PF - Entradas
  { nome: 'Salário Mensal', tipo: 'entrada', valor: 5000.00, data: new Date().toISOString().split('T')[0], origem: 'PF', forma_pagamento: 'pix', status: 'realizada', recorrencia: 'Fee Mensal', is_recorrente: true, recorrencia_tipo: 'mensal', recorrencia_total_ocorrencias: 12, recorrencia_ocorrencia_atual: 1, recorrencia_ativa: true },
  { nome: 'Freelance Projeto X', tipo: 'entrada', valor: 1500.00, data: subMonths(new Date(), 1).toISOString().split('T')[0], origem: 'PF', forma_pagamento: 'pix', status: 'realizada', recorrencia: 'Avulso' },
  // PF - Saídas
  { nome: 'Aluguel', tipo: 'saida', valor: 1200.00, data: new Date().toISOString().split('T')[0], origem: 'PF', forma_pagamento: 'boleto', status: 'realizada', recorrencia: 'Fee Mensal', is_recorrente: true, recorrencia_tipo: 'mensal', recorrencia_total_ocorrencias: 12, recorrencia_ocorrencia_atual: 1, recorrencia_ativa: true },
  { nome: 'Supermercado', tipo: 'saida', valor: 450.00, data: new Date().toISOString().split('T')[0], origem: 'PF', forma_pagamento: 'cartao', status: 'realizada', recorrencia: 'Avulso' },
  { nome: 'Conta de Luz', tipo: 'saida', valor: 150.00, data: endOfMonth(new Date()).toISOString().split('T')[0], origem: 'PF', forma_pagamento: 'pix', status: 'prevista', recorrencia: 'Fee Mensal' },
  
  // PJ - Entradas
  { nome: 'Venda de Serviço A', tipo: 'entrada', valor: 8000.00, data: new Date().toISOString().split('T')[0], origem: 'PJ', forma_pagamento: 'pix', status: 'realizada', recorrencia: 'Setup' },
  { nome: 'Fee Mensal Cliente Y', tipo: 'entrada', valor: 3000.00, data: endOfMonth(new Date()).toISOString().split('T')[0], origem: 'PJ', forma_pagamento: 'boleto', status: 'prevista', recorrencia: 'Fee Mensal', is_recorrente: true, recorrencia_tipo: 'mensal', recorrencia_total_ocorrencias: 6, recorrencia_ocorrencia_atual: 1, recorrencia_ativa: true },
  // PJ - Saídas
  { nome: 'Aluguel Escritório', tipo: 'saida', valor: 2500.00, data: new Date().toISOString().split('T')[0], origem: 'PJ', forma_pagamento: 'pix', status: 'realizada', recorrencia: 'Fee Mensal' },
  { nome: 'Marketing Digital', tipo: 'saida', valor: 1000.00, data: endOfMonth(new Date()).toISOString().split('T')[0], origem: 'PJ', forma_pagamento: 'cartao', status: 'prevista', recorrencia: 'Avulso' },
];

const SEED_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at'>[] = [
  { nome: 'Salário', origem: 'PF', tipo: 'entrada' },
  { nome: 'Aluguel', origem: 'PF', tipo: 'saida', limite_mensal: 1500 },
  { nome: 'Alimentação', origem: 'PF', tipo: 'saida', limite_mensal: 800 },
  { nome: 'Vendas', origem: 'PJ', tipo: 'entrada' },
  { nome: 'Custos Fixos', origem: 'PJ', tipo: 'saida' },
  { nome: 'Marketing', origem: 'PJ', tipo: 'saida' },
];

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
    recorrencia_ativa: data.recorrencia_ativa !== false // Supabase defaults to TRUE, so only explicit FALSE is false
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

  const seedDatabaseIfEmpty = useCallback(async () => {
    try {
      // 1. Verificar se há transações na tabela INTEIRA (sem filtro de user_id)
      const { count: totalTransactionCount, error: countError } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true });

      if (countError) throw countError;

      // Se houver QUALQUER transação, não inserimos os dados mockados.
      if (totalTransactionCount && totalTransactionCount > 0) {
        console.log('Transações existentes detectadas. Pulando inserção de dados iniciais.');
        return;
      }
      
      // Se o banco estiver completamente vazio, inserimos os dados mockados
      console.log('Database completamente vazio. Inserindo dados iniciais...');
      
      // 2. Inserir Categorias
      const categoriesToInsert = SEED_CATEGORIES.map(c => ({ ...c, user_id: userId }));
      const { data: insertedCategories, error: catError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();
        
      if (catError) throw catError;
      
      // Mapear IDs das categorias inseridas
      const categoryIdMap: { [key: string]: string } = {};
      insertedCategories.forEach(c => {
          const seedCategory = SEED_CATEGORIES.find(sc => sc.nome === c.nome && sc.origem === c.origem);
          if (seedCategory) {
              categoryIdMap[seedCategory.nome] = c.id;
          }
      });

      // 3. Inserir Transações
      const transactionsToInsert = SEED_TRANSACTIONS.map(t => {
          const categoryName = SEED_CATEGORIES.find(c => c.nome === t.nome)?.nome || 
                               (t.nome.includes('Salário') ? 'Salário' : 
                                t.nome.includes('Aluguel') ? 'Aluguel' : 
                                t.nome.includes('Supermercado') ? 'Alimentação' : 
                                t.nome.includes('Venda') ? 'Vendas' : 
                                t.nome.includes('Fee Mensal') ? 'Vendas' : 
                                t.nome.includes('Marketing') ? 'Marketing' : 
                                '');
          
          const categoryId = categoryIdMap[categoryName];
          
          return {
              ...t,
              user_id: userId,
              categoria_id: categoryId || null,
              // Garantir que campos opcionais vazios sejam null
              cliente_id: t.cliente_id || null,
              subcategoria_id: t.subcategoria_id || null,
              dependencia: t.dependencia || null,
              recorrencia: t.recorrencia || null,
              observacoes: t.observacoes || null,
              recorrencia_tipo: t.recorrencia_tipo || null,
              recorrencia_total_ocorrencias: t.recorrencia_total_ocorrencias || null,
              recorrencia_ocorrencia_atual: t.recorrencia_ocorrencia_atual || null,
              recorrencia_transacao_pai_id: t.recorrencia_transacao_pai_id || null,
              recorrencia_proxima_data: t.recorrencia_proxima_data || null,
          };
      });
      
      const { error: transError } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);

      if (transError) throw transError;
      
      console.log('Dados iniciais inseridos com sucesso.');
      showSuccess('Dados iniciais carregados! Por favor, clique em Refresh para ver as recorrências geradas.');
      
      // Tentar gerar recorrências imediatamente
      await supabase.rpc('gerar_proximas_transacoes_recorrentes');
      
    } catch (error) {
      console.error('Erro ao inserir dados iniciais:', error);
      showError('Erro ao inicializar dados de exemplo.');
    }
  }, [showError, userId]);


  const loadTransactions = useCallback(async () => {
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
  }, [showError, userId]);

  const loadCategories = useCallback(async () => {
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
  }, [showError, userId]);

  const loadClients = useCallback(async () => {
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
  }, [showError, userId]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Reivindicar transações sem user_id para o mock user (restaura dados antigos)
      console.log('Reivindicando transações sem user_id...');
      const { data: claimedCount, error: claimError } = await supabase.rpc('claim_unowned_transactions');
      
      if (claimError) {
        console.warn('Erro ao reivindicar transações:', claimError);
      } else if (claimedCount && claimedCount > 0) {
        console.log(`${claimedCount} transações reivindicadas.`);
        showSuccess(`${claimedCount} transações antigas foram restauradas!`);
      }
      
      // 2. Tenta inserir dados iniciais SE O BANCO ESTIVER VAZIO
      await seedDatabaseIfEmpty();
      
      // 3. Carrega todos os dados (agora incluindo os reivindicados ou os mockados)
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
  }, [showError, loadTransactions, loadCategories, loadClients, seedDatabaseIfEmpty, showSuccess]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
          // Chama a função RPC para gerar as transações filhas
          const { error: rpcError } = await supabase.rpc('gerar_proximas_transacoes_recorrentes');
          if (rpcError) {
            console.warn('Erro ao gerar transações recorrentes:', rpcError);
          }
          
          // Pequeno delay para garantir que o banco processou a RPC antes de recarregar
          setTimeout(async () => {
            await loadTransactions();
          }, 1000);
          
          showSuccess(`Transação recorrente criada! ${transaction.recorrencia_total_ocorrencias} transações foram programadas.`);
        } catch (error) {
          console.warn('Erro ao processar recorrência:', error);
          showSuccess('Transação criada com sucesso!');
        }
      } else {
        showSuccess('Transação criada com sucesso!');
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
      
      // Cria um objeto de atualização, mapeando undefined/vazio para null para o Supabase
      const updateData: Record<string, any> = {};
      
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof Partial<Transaction>];
        
        if (value === undefined) {
          // Ignora campos undefined
          return;
        }
        
        if (typeof value === 'string' && value.trim() === '') {
          // Mapeia strings vazias para null
          updateData[key] = null;
        } else if (value === null) {
          // Mantém null
          updateData[key] = null;
        } else if (typeof value === 'number' && isNaN(value)) {
          // Mapeia NaN para null
          updateData[key] = null;
        } else {
          // Usa o valor, incluindo booleans (true/false) e números válidos
          updateData[key] = value;
        }
      });
      
      // Garante que o user_id não seja alterado
      delete updateData.user_id;
      
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