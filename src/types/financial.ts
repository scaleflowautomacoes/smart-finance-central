
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
