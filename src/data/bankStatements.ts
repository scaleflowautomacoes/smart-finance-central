import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import type { ParsedStatementImport, ParsedStatementMovement } from '@/lib/bankStatementImport';

export interface ExistingTransactionFingerprint {
  nome: string;
  tipo: 'entrada' | 'saida';
  data: string;
  valor: number;
  origem: 'PF' | 'PJ';
  forma_pagamento: 'pix' | 'boleto' | 'cartao' | 'dinheiro';
}

export const createBankStatementImport = async (payload: TablesInsert<'bank_statement_imports'>) => {
  const { data, error } = await supabase
    .from('bank_statement_imports')
    .upsert(payload, { onConflict: 'source_hash' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const upsertBankStatementEntries = async (entries: TablesInsert<'bank_statement_entries'>[]) => {
  if (entries.length === 0) return [];

  const { data, error } = await supabase
    .from('bank_statement_entries')
    .upsert(entries, { onConflict: 'raw_hash', ignoreDuplicates: true })
    .select();

  if (error) throw error;
  return data ?? [];
};

export const importStatementPayload = (statement: ParsedStatementImport, workspace: 'PF' | 'PJ') => ({
  workspace,
  source_name: statement.sourceName,
  source_hash: statement.sourceHash,
  account_holder: statement.accountHolder,
  account_document: statement.accountDocument,
  account_bank: statement.accountBank,
  period_start: statement.periodStart,
  period_end: statement.periodEnd,
  page_count: statement.pageCount,
  total_entries: statement.totalEntries,
  total_exits: statement.totalExits,
  final_balance: statement.finalBalance,
  statement_currency: 'BRL',
  source_type: 'pdf',
  status: 'parsed',
  metadata: {
    source: 'pj-statement-import',
    movement_count: statement.movements.length,
  },
});

export const movementToTransaction = (
  movement: ParsedStatementMovement,
  overrides: {
    origin: 'PF' | 'PJ';
    categoryId?: string | null;
    existingFingerprint?: ExistingTransactionFingerprint | null;
  }
) => ({
  nome: movement.counterpartyName || movement.description,
  tipo: movement.direction,
  valor: movement.amount,
  data: movement.statementDate,
  origem: overrides.origin,
  forma_pagamento: movement.movementType === 'boleto' ? 'boleto' : movement.movementType === 'debito' ? 'cartao' : 'pix',
  status: 'realizada',
  cliente_id: null,
  categoria_id: overrides.categoryId ?? null,
  subcategoria_id: null,
  dependencia: null,
  recorrencia: null,
  observacoes: `Importado do extrato PJ. ${movement.counterpartyBank ? `Banco: ${movement.counterpartyBank}. ` : ''}${movement.counterpartyDocument ? `Documento: ${movement.counterpartyDocument}. ` : ''}Categoria sugerida: ${movement.suggestedCategory}.`,
  deletado: false,
  is_recorrente: false,
  recorrencia_tipo: null,
  recorrencia_total_ocorrencias: null,
  recorrencia_ocorrencia_atual: null,
  recorrencia_transacao_pai_id: null,
  recorrencia_proxima_data: null,
  recorrencia_ativa: true,
});

export const movementToEntry = (
  importId: string,
  workspace: 'PF' | 'PJ',
  movement: ParsedStatementMovement,
  transactionId: string | null,
  rawHash: string,
  categoryId: string | null
): TablesInsert<'bank_statement_entries'> => ({
  import_id: importId,
  workspace,
  statement_date: movement.statementDate,
  page_number: movement.pageNumber,
  line_index: movement.lineIndex,
  direction: movement.direction,
  movement_type: movement.movementType,
  description: movement.description,
  counterparty_name: movement.counterpartyName,
  counterparty_document: movement.counterpartyDocument,
  counterparty_bank: movement.counterpartyBank,
  amount: movement.amount,
  running_balance: movement.runningBalance,
  raw_text: movement.rawText,
  raw_hash: rawHash,
  suggested_category: movement.suggestedCategory,
  final_category_id: categoryId,
  transaction_id: transactionId,
  status: transactionId ? 'linked' : 'suggested',
  metadata: {
    confidence: movement.confidence,
    direction: movement.direction,
  },
});

export const fingerprintTransaction = (payload: ExistingTransactionFingerprint) =>
  `${payload.data}|${payload.tipo}|${payload.valor.toFixed(2)}|${payload.origem}|${payload.forma_pagamento}|${payload.nome.toLowerCase()}`;
