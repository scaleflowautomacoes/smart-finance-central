import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category, Client, TablesInsert, TablesUpdate } from '@/types/financial';
import { useMockUserId } from '@/hooks/useMockUserId';
import { startOfDay, endOfDay } from 'date-fns';

const userId = useMockUserId();

// --- Converters ---

const convertToTransaction = (data: any): Transaction => {
  if (!data) throw new Error('Dados da transação não encontrados');
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
    dependencia: data.dependencia as any,
    recorrencia: data.recorrencia as any,
    observacoes: data.observacoes,
    deletado: data.deletado || false,
    is_recorrente: data.is_recorrente || false,
    recorrencia_tipo: data.recorrencia_tipo as any,
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
  limite_mensal: data.limite_mensal ? parseFloat(data.limite_mensal) : undefined,
});

// --- Data Access Functions ---

export async function fetchTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('deletado', false)
    .order('data', { ascending: false });

  // Aplicar filtro de data se fornecido
  if (startDate) {
    const start = startOfDay(startDate);
    query = query.gte('data', start.toISOString().split('T')[0]);
  }

  if (endDate) {
    const end = endOfDay(endDate);
    query = query.lte('data', end.toISOString().split('T')[0]);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []).map(convertToTransaction);
}

// REMOVIDO: fetchCategories e fetchClients (agora em useAuxiliaryData)

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'deletado'>): Promise<Transaction> {
  const insertData = {
    ...transaction,
    user_id: null, // RLS permite user_id NULL
    valor: transaction.valor,
    data: transaction.data,
    deletado: false,
    // Mapear undefined/vazio para null para o Supabase
    cliente_id: transaction.cliente_id || null,
    categoria_id: transaction.categoria_id || null,
    subcategoria_id: transaction.subcategoria_id || null,
    dependencia: transaction.dependencia || null,
    recorrencia: transaction.recorrencia || null,
    observacoes: transaction.observacoes || null,
    recorrencia_tipo: transaction.recorrencia_tipo || null,
    recorrencia_total_ocorrencias: transaction.recorrencia_total_ocorrencias || null,
    recorrencia_ocorrencia_atual: transaction.recorrencia_ocorrencia_atual || null,
    recorrencia_transacao_pai_id: transaction.recorrencia_transacao_pai_id || null,
    recorrencia_ativa: transaction.recorrencia_ativa !== false,
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;
  return convertToTransaction(data);
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const updateData: any = {};
  
  // Mapeamento seguro de updates para o tipo Supabase
  Object.keys(updates).forEach(key => {
    const value = updates[key as keyof Partial<Transaction>];
    if (value !== undefined) {
      updateData[key] = (
        (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && isNaN(value))
          ? null
          : value
      );
    }
  });

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function softDeleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({ deletado: true })
    .eq('id', id);

  if (error) throw error;
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const insertData = {
    ...category,
    limite_mensal: category.limite_mensal || null,
  };
  
  const { data, error } = await supabase
    .from('categories')
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;
  return convertToCategory(data);
}

export async function claimUnownedTransactions(): Promise<number> {
  const { data: claimedCount, error: claimError } = await supabase.rpc('claim_unowned_transactions');
  if (claimError) throw claimError;
  return claimedCount || 0;
}

export async function generateRecurrences(): Promise<void> {
  const { error } = await supabase.rpc('gerar_proximas_transacoes_recorrentes');
  if (error) throw error;
}