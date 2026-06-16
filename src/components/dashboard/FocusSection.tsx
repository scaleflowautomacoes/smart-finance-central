import React from 'react';
import { FocusCard } from './FocusCard';
import { useCentralMetrics } from '@/hooks/useCentralMetrics';
import { Transaction } from '@/types/financial';
import { buildDerivedCategoryMap, dedupeGeneratedRecurrences, resolveEffectiveCategoryId } from '@/lib/financialAnalytics';

interface FocusSectionProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

interface FocusItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export const FocusSection: React.FC<FocusSectionProps> = ({
  transactions,
  workspace,
  startDate,
  endDate,
}) => {
  const { metrics } = useCentralMetrics({
    transactions,
    workspace,
    startDate,
    endDate,
  });

  const generateFocuses = (): FocusItem[] => {
    const focuses: FocusItem[] = [];
    const scopedTransactions = dedupeGeneratedRecurrences(transactions).filter(
      (transaction) => transaction.origem === workspace && !transaction.deletado,
    );
    const derivedCategories = buildDerivedCategoryMap(scopedTransactions);

    // Verificar entradas vencidas
    if (metrics.entradasVencidas > 0) {
      focuses.push({
        priority: 'high',
        title: 'Cobrar recebimentos vencidos',
        description: `Existem ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.entradasVencidas)} em entradas vencidas que precisam ser cobradas.`,
      });
    }

    // Verificar saídas vencidas
    if (metrics.saidasVencidas > 0) {
      focuses.push({
        priority: 'high',
        title: 'Resolver pagamentos vencidos',
        description: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.saidasVencidas)} em saídas vencidas precisam de atenção imediata.`,
      });
    }

    // Verificar saldo projetado negativo
    if (metrics.saldoProjetado < 0) {
      focuses.push({
        priority: 'high',
        title: 'Saldo projetado negativo',
        description: 'Com base nos dados atuais, o saldo projetado está negativo. Revise gastos e recebimentos.',
      });
    }

    // Verificar despesas altas
    if (metrics.despesasReceitasRatio > 90) {
      focuses.push({
        priority: 'medium',
        title: 'Despesas consumindo quase todo o caixa',
        description: `As despesas representam ${metrics.despesasReceitasRatio.toFixed(0)}% das receitas. Considere revisar gastos.`,
      });
    }

    // Verificar transações sem categoria
    const transactionsWithoutCategory = scopedTransactions.filter(
      t => !resolveEffectiveCategoryId(t, derivedCategories)
    );
    if (transactionsWithoutCategory.length > 0) {
      focuses.push({
        priority: 'medium',
        title: 'Transações sem categoria',
        description: `${transactionsWithoutCategory.length} transações não possuem categoria definida. Categorize para melhor análise.`,
      });
    }

    // Se não houver focos, mostrar status saudável
    if (focuses.length === 0) {
      focuses.push({
        priority: 'low',
        title: 'Financeiro em dia',
        description: 'Não há alertas críticos no momento. Continue acompanhando as métricas.',
      });
    }

    // Retornar apenas os 3 primeiros focos (mais prioritários)
    return focuses.slice(0, 3);
  };

  const focuses = generateFocuses();

  return (
    <div className="space-y-3">
      {focuses.map((focus, index) => (
        <FocusCard
          key={index}
          priority={focus.priority}
          title={focus.title}
          description={focus.description}
        />
      ))}
    </div>
  );
};
