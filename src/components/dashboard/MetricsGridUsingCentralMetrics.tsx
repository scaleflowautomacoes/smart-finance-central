import React from 'react';
import { MetricCard } from './MetricCard';
import { StatusBadge } from './StatusBadge';
import { useCentralMetrics } from '@/hooks/useCentralMetrics';
import { Transaction } from '@/types/financial';

interface MetricsGridUsingCentralMetricsProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate?: Date;
  endDate?: Date;
}

export const MetricsGridUsingCentralMetrics: React.FC<MetricsGridUsingCentralMetricsProps> = ({
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Receitas do período"
        value={metrics.totalEntradas}
        variation={metrics.variation.entradas}
        variant="income"
      />
      <MetricCard
        title="Despesas do período"
        value={metrics.totalSaidas}
        variation={metrics.variation.saidas}
        variant="expense"
        suffix={`Pendente: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.saidasPrevistas)}`}
      />
      <MetricCard
        title="Saldo do período"
        value={metrics.saldoProjetado}
        variation={metrics.variation.saldo}
        variant={metrics.saldoProjetado >= 0 ? 'balance' : 'expense'}
      />
      <div className="flex flex-col justify-center">
        <StatusBadge
          status={metrics.healthScore === 'Excelente' || metrics.healthScore === 'Bom' ? 'healthy' : metrics.healthScore === 'Regular' ? 'warning' : 'critical'}
          label={`Saúde: ${metrics.healthScore}`}
        />
        <div className="mt-2 text-sm text-muted-foreground">
          Despesas/Receitas: {metrics.despesasReceitasRatio.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};