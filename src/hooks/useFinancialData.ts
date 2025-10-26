
import { useState, useEffect } from 'react';
import { Transaction, Category, Client, DashboardMetrics } from '@/types/financial';
import { isWithinInterval } from 'date-fns';

// Mock data expandido com novas categorias
const mockTransactions: Transaction[] = [
  {
    id: '1',
    nome: 'Salário Janeiro',
    tipo: 'entrada',
    origem: 'PF',
    valor: 5000,
    data: '2025-01-05',
    forma_pagamento: 'pix',
    status: 'realizada',
    categoria_id: '1',
    recorrencia: 'Fee Mensal',
    observacoes: 'Salário mensal',
    deletado: false
  },
  {
    id: '2',
    nome: 'Supermercado',
    tipo: 'saida',
    origem: 'PF',
    valor: 350,
    data: '2025-01-03',
    forma_pagamento: 'cartao',
    status: 'realizada',
    categoria_id: '2',
    recorrencia: 'Avulso',
    observacoes: 'Compras do mês',
    deletado: false
  },
  {
    id: '3',
    nome: 'Automação WhatsApp - Cliente Premium',
    tipo: 'entrada',
    origem: 'PJ',
    valor: 2500,
    data: '2025-01-02',
    forma_pagamento: 'pix',
    status: 'realizada',
    categoria_id: '19',
    dependencia: 'Infoprodutos',
    recorrencia: 'Setup',
    observacoes: 'Setup inicial para cliente',
    deletado: false
  },
  {
    id: '4',
    nome: 'Ferramentas de Marketing',
    tipo: 'saida',
    origem: 'PJ',
    valor: 450,
    data: '2025-01-10',
    forma_pagamento: 'cartao',
    status: 'prevista',
    categoria_id: '4',
    dependencia: 'Disparos',
    recorrencia: 'Fee Mensal',
    observacoes: 'Mensalidade das ferramentas',
    deletado: false
  }
];

const mockCategories: Category[] = [
  // PF - Entradas
  { id: '1', nome: 'Salário', origem: 'PF', tipo: 'entrada', limite_mensal: 10000 },
  { id: '18', nome: 'Bônus', origem: 'PF', tipo: 'entrada', limite_mensal: 5000 },
  
  // PF - Saídas
  { id: '2', nome: 'Alimentação', origem: 'PF', tipo: 'saida', limite_mensal: 800 },
  { id: '15', nome: 'Aluguel', origem: 'PF', tipo: 'saida', limite_mensal: 2000 },
  { id: '17', nome: 'Investimentos', origem: 'PF', tipo: 'saida', limite_mensal: 3000 },
  { id: '16', nome: 'Mercado', origem: 'PF', tipo: 'saida', limite_mensal: 600 },
  
  // PJ - Entradas
  { id: '3', nome: 'Infoprodutos', origem: 'PJ', tipo: 'entrada', limite_mensal: 15000 },
  { id: '19', nome: 'Automação de WhatsApp', origem: 'PJ', tipo: 'entrada', limite_mensal: 8000 },
  { id: '20', nome: 'Disparos e campanhas', origem: 'PJ', tipo: 'entrada', limite_mensal: 5000 },
  { id: '21', nome: 'Tráfego Pago', origem: 'PJ', tipo: 'entrada', limite_mensal: 10000 },
  { id: '22', nome: 'Social Media', origem: 'PJ', tipo: 'entrada', limite_mensal: 4000 },
  { id: '23', nome: 'Criação de Sites', origem: 'PJ', tipo: 'entrada', limite_mensal: 6000 },
  { id: '24', nome: 'Gestão de Projetos', origem: 'PJ', tipo: 'entrada', limite_mensal: 7000 },
  
  // PJ - Saídas
  { id: '4', nome: 'Marketing', origem: 'PJ', tipo: 'saida', limite_mensal: 2000 },
  { id: '14', nome: 'Pro-labore', origem: 'PJ', tipo: 'saida', limite_mensal: 8000 }
];

const mockClients: Client[] = [
  { id: '1', nome: 'Cliente Premium', tipo: 'recorrente', ativo: true },
  { id: '2', nome: 'Cliente Básico', tipo: 'avulso', ativo: true },
  { id: '3', nome: 'Empresa ABC', tipo: 'recorrente', ativo: true },
  { id: '4', nome: 'Startup XYZ', tipo: 'avulso', ativo: true }
];

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('financial-transactions');
    return saved ? JSON.parse(saved) : mockTransactions;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('financial-categories');
    return saved ? JSON.parse(saved) : mockCategories;
  });
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('financial-clients');
    return saved ? JSON.parse(saved) : mockClients;
  });

  // Salvar no localStorage quando os dados mudarem
  useEffect(() => {
    localStorage.setItem('financial-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financial-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('financial-clients', JSON.stringify(clients));
  }, [clients]);

  const calculateMetrics = (origem: 'PF' | 'PJ', startDate?: Date, endDate?: Date): DashboardMetrics => {
    let filteredTransactions = transactions.filter(t => t.origem === origem && !t.deletado);
    
    // Apply date filter if provided
    if (startDate && endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.data);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });
    }
    
    const entradas = filteredTransactions.filter(t => t.tipo === 'entrada');
    const saidas = filteredTransactions.filter(t => t.tipo === 'saida');
    
    const entradasPrevistas = entradas.reduce((sum, t) => sum + (t.status === 'prevista' ? t.valor : 0), 0);
    const entradasRealizadas = entradas.reduce((sum, t) => sum + (t.status === 'realizada' ? t.valor : 0), 0);
    const saidasPrevistas = saidas.reduce((sum, t) => sum + (t.status === 'prevista' ? t.valor : 0), 0);
    const saidasPagas = saidas.reduce((sum, t) => sum + (t.status === 'realizada' ? t.valor : 0), 0);
    
    return {
      entradasPrevistas,
      entradasRealizadas,
      saidasPrevistas,
      saidasPagas,
      saldoProjetado: (entradasPrevistas + entradasRealizadas) - (saidasPrevistas + saidasPagas),
      saldoReal: entradasRealizadas - saidasPagas
    };
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'deletado'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      deletado: false
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, deletado: true } : t));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  return {
    transactions,
    categories,
    clients,
    calculateMetrics,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory
  };
};
