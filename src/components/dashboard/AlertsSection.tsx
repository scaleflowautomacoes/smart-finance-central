import React from 'react';
import { AlertCard } from './AlertCard';
import { useCentralMetrics } from '@/hooks/useCentralMetrics';
import { Transaction } from '@/types/financial';

interface AlertsSectionProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

interface AlertItem {
  type: 'critical' | 'warning' | 'info' | 'healthy';
  title: string;
  description: string;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({
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

  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    // Alertas críticos
    if (metrics.saldoProjetado < 0) {
      alerts.push({
        type: 'critical',
        title: 'Saldo projetado negativo',
        description: 'O saldo projetado está negativo. Revise gastos e recebimentos imediatamente.',
      });
    }

    if (metrics.entradasVencidas > 0) {
      alerts.push({
        type: 'critical',
        title: 'Entradas vencidas',
        description: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.entradasVencidas)} em entradas vencidas precisam ser cobradas.`,
      });
    }

    if (metrics.saidasVencidas > 0) {
      alerts.push({
        type: 'critical',
        title: 'Saídas vencidas',
        description: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.saidasVencidas)} em saídas vencidas precisam de pagamento.`,
      });
    }

    // Alertas de atenção
    if (metrics.despesasReceitasRatio > 90) {
      alerts.push({
        type: 'warning',
        title: 'Despesas altas',
        description: `As despesas representam ${metrics.despesasReceitasRatio.toFixed(0)}% das receitas. Considere revisar gastos.`,
      });
    }

    // Alertas informativos
    if (metrics.variation.entradas < -20) {
      alerts.push({
        type: 'info',
        title: 'Receitas em queda',
        description: `As receitas caíram ${Math.abs(metrics.variation.entradas).toFixed(0)}% em relação ao período anterior.`,
      });
    }

    if (metrics.variation.saidas > 20) {
      alerts.push({
        type: 'info',
        title: 'Despesas em alta',
        description: `As despesas aumentaram ${metrics.variation.saidas.toFixed(0)}% em relação ao período anterior.`,
      });
    }

    // Se não houver alertas, mostrar status saudável
    if (alerts.length === 0) {
      alerts.push({
        type: 'healthy',
        title: 'Financeiro saudável',
        description: 'Não há alertas no momento. Continue acompanhando as métricas.',
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <AlertCard
          key={index}
          type={alert.type}
          title={alert.title}
          description={alert.description}
        />
      ))}
    </div>
  );
};