import { useMemo } from 'react';
import { Transaction, Category } from '@/types/financial';
import { isWithinInterval } from 'date-fns';
import { FinancialMetrics } from './useFinancialCalculations';

export interface DREMetrics {
  receitaBruta: number;
  deducoesImpostos: number;
  receitaLiquida: number;
  custosVariaveis: number;
  margemContribuicao: number;
  custosFixos: number;
  ebitda: number;
  despesasFinanceiras: number;
  receitasFinanceiras: number;
  lucroLiquido: number;
  
  // Indicadores
  margemBrutaPercent: number;
  margemLiquidaPercent: number;
}

// Mapeamento simplificado de categorias para DRE (assumindo que categorias são marcadas ou inferidas)
// Para esta implementação, vamos usar um mapeamento baseado em nomes/tipos para simular a estrutura DRE.
const DRE_CATEGORY_MAP = {
  DEDUCOES_IMPOSTOS: ['Impostos', 'Taxas'],
  CUSTOS_VARIAVEIS: ['Fornecedores', 'Marketing', 'Chips', 'Disparos'],
  CUSTOS_FIXOS: ['Aluguel Escritório', 'Pro-labore', 'Internet'],
  DESPESAS_FINANCEIRAS: ['Juros', 'Taxas Bancárias'],
  RECEITAS_FINANCEIRAS: ['Rendimentos', 'Juros Recebidos'],
};

const getCategoryName = (categoryId: string | undefined, categories: Category[]): string => {
  return categories.find(c => c.id === categoryId)?.nome || 'Outros';
};

const calculateDRE = (
  transactions: Transaction[],
  categories: Category[],
  workspace: 'PF' | 'PJ',
  startDate: Date,
  endDate: Date
): DREMetrics => {
  const filteredTransactions = transactions.filter(t => 
    t.origem === workspace && 
    !t.deletado &&
    t.status === 'realizada' && // DRE foca em valores realizados
    isWithinInterval(new Date(t.data), { start: startDate, end: endDate })
  );

  let receitaBruta = 0;
  let deducoesImpostos = 0;
  let custosVariaveis = 0;
  let custosFixos = 0;
  let despesasFinanceiras = 0;
  let receitasFinanceiras = 0;

  filteredTransactions.forEach(t => {
    const categoryName = getCategoryName(t.categoria_id, categories);
    
    if (t.tipo === 'entrada') {
      receitaBruta += t.valor;
      
      if (DRE_CATEGORY_MAP.RECEITAS_FINANCEIRAS.includes(categoryName)) {
        receitasFinanceiras += t.valor;
      }
    } else { // Saída
      if (DRE_CATEGORY_MAP.DEDUCOES_IMPOSTOS.includes(categoryName)) {
        deducoesImpostos += t.valor;
      } else if (DRE_CATEGORY_MAP.CUSTOS_VARIAVEIS.includes(categoryName)) {
        custosVariaveis += t.valor;
      } else if (DRE_CATEGORY_MAP.CUSTOS_FIXOS.includes(categoryName)) {
        custosFixos += t.valor;
      } else if (DRE_CATEGORY_MAP.DESPESAS_FINANCEIRAS.includes(categoryName)) {
        despesasFinanceiras += t.valor;
      }
    }
  });

  const receitaLiquida = receitaBruta - deducoesImpostos;
  const margemContribuicao = receitaLiquida - custosVariaveis;
  const ebitda = margemContribuicao - custosFixos;
  
  // Simplificando EBIT e Lucro Antes de Impostos (sem depreciação/amortização)
  const lucroAntesImpostos = ebitda - despesasFinanceiras + receitasFinanceiras;
  const lucroLiquido = lucroAntesImpostos; // Assumindo impostos sobre lucro = 0 por enquanto

  // Indicadores
  const margemBrutaPercent = receitaBruta > 0 ? ((receitaBruta - deducoesImpostos) / receitaBruta) * 100 : 0;
  const margemLiquidaPercent = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

  return {
    receitaBruta,
    deducoesImpostos,
    receitaLiquida,
    custosVariaveis,
    margemContribuicao,
    custosFixos,
    ebitda,
    despesasFinanceiras,
    receitasFinanceiras,
    lucroLiquido,
    margemBrutaPercent,
    margemLiquidaPercent,
  };
};

export const useProfitLoss = (
  transactions: Transaction[],
  categories: Category[],
  workspace: 'PF' | 'PJ',
  startDate: Date,
  endDate: Date
) => {
  const dreMetrics = useMemo(() => {
    return calculateDRE(transactions, categories, workspace, startDate, endDate);
  }, [transactions, categories, workspace, startDate, endDate]);

  return { dreMetrics, loading: false };
};