
import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { addDays, format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CashAlert {
  type: 'critical' | 'warning' | 'info';
  message: string;
  value?: number;
}

export const useCashFlowAlerts = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ'
): CashAlert[] => {
  return useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const workspaceTransactions = transactions.filter(t => 
      t.origem === workspace && 
      !t.deletado &&
      t.recorrencia_ativa !== false &&
      isWithinInterval(new Date(t.data), { start: monthStart, end: monthEnd })
    );

    const alerts: CashAlert[] = [];

    // Calcular entradas e saídas
    const entradasPrevistas = workspaceTransactions
      .filter(t => t.tipo === 'entrada' && (t.status === 'prevista' || t.status === 'vencida'))
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saidasPrevistas = workspaceTransactions
      .filter(t => t.tipo === 'saida' && (t.status === 'prevista' || t.status === 'vencida'))
      .reduce((sum, t) => sum + t.valor, 0);

    const entradasRealizadas = workspaceTransactions
      .filter(t => t.tipo === 'entrada' && t.status === 'realizada')
      .reduce((sum, t) => sum + t.valor, 0);

    const deficit = saidasPrevistas - (entradasPrevistas + entradasRealizadas);

    // Alerta principal
    if (saidasPrevistas > 0) {
      if (deficit > saidasPrevistas * 0.5) {
        alerts.push({
          type: 'critical',
          message: `Déficit crítico: R$ ${deficit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          value: deficit
        });
      } else if (deficit > 0) {
        alerts.push({
          type: 'warning',
          message: `Déficit: R$ ${deficit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          value: deficit
        });
      } else {
        alerts.push({
          type: 'info',
          message: `Caixa equilibrado`,
          value: 0
        });
      }
    }

    // Vencimentos próximos (10 dias)
    const proximosDez = addDays(now, 10);
    const vencimentosProximos = workspaceTransactions
      .filter(t => 
        t.tipo === 'saida' && 
        t.status === 'prevista' &&
        isWithinInterval(new Date(t.data), { start: now, end: proximosDez })
      )
      .reduce((sum, t) => sum + t.valor, 0);

    if (vencimentosProximos > 0) {
      alerts.push({
        type: vencimentosProximos > entradasRealizadas ? 'warning' : 'info',
        message: `Próximos 10 dias: R$ ${vencimentosProximos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        value: vencimentosProximos
      });
    }

    return alerts;
  }, [transactions, workspace]);
};
