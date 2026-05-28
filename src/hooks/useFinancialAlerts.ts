
import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { startOfMonth, endOfMonth, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  compareFinancialDateStrings,
  formatFinancialDate,
  isFinancialDateWithinRange,
  parseFinancialDate,
} from '@/utils/financialDate';
import { isProjectedTransaction } from '@/utils/transactionStatus';

export interface FinancialAlert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  value?: number;
  date?: Date;
}

export interface CashFlowMetrics {
  totalRequired: number;
  pfDeficit: number;
  pjDeficit: number;
  criticalDates: Array<{ date: Date; amount: number; description: string }>;
  idealReceivingPeriod: { start: Date; end: Date };
}

export const useFinancialAlerts = (transactions: Transaction[], workspace: 'PF' | 'PJ') => {
  const alerts = useMemo((): FinancialAlert[] => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Filtrar transações do workspace específico e mês atual
    const workspaceTransactions = transactions.filter(t => 
      !t.deletado &&
      t.origem === workspace &&
      t.recorrencia_ativa !== false &&
      isFinancialDateWithinRange(t.data, monthStart, monthEnd)
    );

    console.log(`[${workspace}] Transações do mês:`, workspaceTransactions.length);
    
    // Calcular entradas e saídas previstas (incluindo recorrentes)
    const entradasPrevistas = workspaceTransactions
      .filter(t => t.tipo === 'entrada' && isProjectedTransaction(t))
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saidasPrevistas = workspaceTransactions
      .filter(t => t.tipo === 'saida' && isProjectedTransaction(t))
      .reduce((sum, t) => sum + t.valor, 0);

    // Calcular entradas realizadas
    const entradasRealizadas = workspaceTransactions
      .filter(t => t.tipo === 'entrada' && t.status === 'realizada')
      .reduce((sum, t) => sum + t.valor, 0);

    const deficit = saidasPrevistas - (entradasPrevistas + entradasRealizadas);
    const totalNecessario = saidasPrevistas + (saidasPrevistas * 0.1); // 10% margem
    
    console.log(`[${workspace}] Entradas previstas: R$ ${entradasPrevistas}`);
    console.log(`[${workspace}] Saídas previstas: R$ ${saidasPrevistas}`);
    console.log(`[${workspace}] Déficit: R$ ${deficit}`);
    
    const alertas: FinancialAlert[] = [];

    // Alerta principal do workspace
    if (saidasPrevistas > 0) {
      const severity = deficit > saidasPrevistas * 0.5 ? 'critical' : (deficit > 0 ? 'warning' : 'info');
      alertas.push({
        type: severity,
        title: `Caixa ${workspace}`,
        message: `R$ ${saidasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em saídas${deficit > 0 ? `. Déficit: R$ ${deficit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ' - OK'}`,
        value: deficit > 0 ? deficit : totalNecessario
      });
    }

    // Vencimentos próximos (próximos 10 dias)
    const proximosDez = addDays(now, 10);
    const vencimentosProximos = workspaceTransactions.filter(t => 
      t.tipo === 'saida' && 
      t.status === 'prevista' &&
      isFinancialDateWithinRange(t.data, now, proximosDez)
    );

    const valorProximosDez = vencimentosProximos.reduce((sum, t) => sum + t.valor, 0);

    if (valorProximosDez > 0) {
      alertas.push({
        type: valorProximosDez > entradasRealizadas ? 'warning' : 'info',
        title: `Próximos 10 dias`,
        message: `R$ ${valorProximosDez.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} até ${format(proximosDez, 'dd/MM', { locale: ptBR })}`,
        value: valorProximosDez,
        date: proximosDez
      });
    }

    // Período ideal para recebimentos (apenas se houver entradas previstas)
    const recebimentos = workspaceTransactions.filter(t => 
      t.tipo === 'entrada' && 
      t.status === 'prevista'
    ).sort((a, b) => compareFinancialDateStrings(a.data, b.data));

    if (recebimentos.length > 0) {
      const primeiroRecebimento = parseFinancialDate(recebimentos[0].data);
      const ultimoRecebimento = parseFinancialDate(recebimentos[recebimentos.length - 1].data);
      
      alertas.push({
        type: 'info',
        title: 'Recebimentos',
        message: `Ideal: ${format(primeiroRecebimento, 'dd', { locale: ptBR })} à ${format(ultimoRecebimento, 'dd', { locale: ptBR })}`,
        date: primeiroRecebimento
      });
    }

    return alertas;
  }, [transactions, workspace]);

  const metrics = useMemo((): CashFlowMetrics => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const workspaceTransactions = transactions.filter(t => 
      !t.deletado &&
      t.origem === workspace &&
      t.recorrencia_ativa !== false &&
      isFinancialDateWithinRange(t.data, monthStart, monthEnd)
    );

    const saidasPrevistas = workspaceTransactions
      .filter(t => t.tipo === 'saida' && isProjectedTransaction(t))
      .reduce((sum, t) => sum + t.valor, 0);

    const entradasPrevistas = workspaceTransactions
      .filter(t => t.tipo === 'entrada' && isProjectedTransaction(t))
      .reduce((sum, t) => sum + t.valor, 0);

    const entradasRealizadas = workspaceTransactions
      .filter(t => t.tipo === 'entrada' && t.status === 'realizada')
      .reduce((sum, t) => sum + t.valor, 0);

    // Calcular datas críticas
    const saidasOrdenadas = workspaceTransactions
      .filter(t => t.tipo === 'saida' && t.status === 'prevista')
      .sort((a, b) => compareFinancialDateStrings(a.data, b.data));

    const criticalDates = saidasOrdenadas.reduce((acc, transaction) => {
      const date = parseFinancialDate(transaction.data);
      const dateKey = formatFinancialDate(date);
      const existing = acc.find(item => 
        formatFinancialDate(item.date) === dateKey
      );
      
      if (existing) {
        existing.amount += transaction.valor;
        existing.description += `, ${transaction.nome}`;
      } else {
        acc.push({
          date,
          amount: transaction.valor,
          description: transaction.nome
        });
      }
      
      return acc;
    }, [] as Array<{ date: Date; amount: number; description: string }>);

    // Período ideal para recebimentos
    const recebimentos = workspaceTransactions
      .filter(t => t.tipo === 'entrada' && t.status === 'prevista')
      .sort((a, b) => compareFinancialDateStrings(a.data, b.data));

    const idealReceivingPeriod = recebimentos.length > 0 ? {
      start: parseFinancialDate(recebimentos[0].data),
      end: parseFinancialDate(recebimentos[recebimentos.length - 1].data)
    } : {
      start: monthStart,
      end: monthEnd
    };

    const deficit = saidasPrevistas - (entradasPrevistas + entradasRealizadas);

    return {
      totalRequired: saidasPrevistas + (saidasPrevistas * 0.1),
      pfDeficit: workspace === 'PF' ? Math.max(0, deficit) : 0,
      pjDeficit: workspace === 'PJ' ? Math.max(0, deficit) : 0,
      criticalDates: criticalDates.slice(0, 3),
      idealReceivingPeriod
    };
  }, [transactions, workspace]);

  return { alerts, metrics };
};
