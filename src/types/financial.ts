export interface Transaction {
  id: string;
  nome: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  data: string;
  origem: 'PF' | 'PJ';
  forma_pagamento: 'pix' | 'boleto' | 'cartao' | 'dinheiro';
  status: 'prevista' | 'realizada' | 'vencida' | 'cancelada';
  cliente_id?: string;
  categoria_id?: string;
  subcategoria_id?: string;
  dependencia?: 'Infoprodutos' | 'Chips' | 'Automações' | 'Disparos' | 'Co-produção';
  recorrencia?: 'Setup' | 'Fee Mensal' | 'Avulso';
  observacoes?: string;
  deletado: boolean;
  // Novas propriedades para recorrência
  is_recorrente?: boolean;
  recorrencia_tipo?: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual';
  recorrencia_total_ocorrencias?: number;
  recorrencia_ocorrencia_atual?: number;
  recorrencia_transacao_pai_id?: string;
  recorrencia_proxima_data?: string;
  recorrencia_ativa?: boolean;
}

export interface Category {
  id: string;
  nome: string;
  origem: 'PF' | 'PJ';
  tipo: 'entrada' | 'saida';
  limite_mensal?: number;
}

export interface Responsavel {
  id: string;
  nome: string;
  tipo: 'recorrente' | 'avulso';
  ativo: boolean;
}

// Alias para compatibilidade
export interface Client extends Responsavel {}

export interface DashboardMetrics {
  entradasPrevistas: number;
  entradasRealizadas: number;
  saidasPrevistas: number;
  saidasPagas: number;
  saldoProjetado: number;
  saldoReal: number;
}

// NOVAS ENTIDADES PARA OS MÓDULOS

export interface Debt {
  id: string;
  user_id: string;
  workspace: 'PF' | 'PJ';
  name: string;
  creditor: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  installments_total: number;
  installments_paid: number;
  due_date: string; // date
  payment_day: number;
  status: 'active' | 'paid' | 'late';
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  workspace: 'PF' | 'PJ';
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // date
  category_id?: string;
  status: 'active' | 'completed' | 'cancelled';
  type: 'saving' | 'revenue' | 'expense_reduction';
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  workspace: 'PF' | 'PJ';
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  current_km: number;
  created_at: string;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  user_id: string;
  type: 'oil_change' | 'tire' | 'brake' | 'general' | 'other';
  description: string;
  cost: number;
  km_performed: number;
  next_km?: number;
  date_performed: string; // date
  next_date?: string; // date
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  workspace: 'PF' | 'PJ';
  name: string;
  type: 'stock' | 'fund' | 'crypto' | 'real_estate' | 'fixed_income' | 'other';
  initial_amount: number;
  current_amount: number;
  purchase_date: string; // date
  expected_return: number; // % anual
  status: 'active' | 'sold';
  created_at: string;
}

// Tipos auxiliares para Supabase - simplificados para compatibilidade
export type TablesInsert<T extends string> = any;
export type TablesUpdate<T extends string> = any;