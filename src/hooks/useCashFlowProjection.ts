import { useMemo } from 'react';
import { Transaction } from '@/types/financial';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface MonthlyProjection {
  monthLabel: string;
  monthStart: Date;
  monthEnd: Date;
  receitasPrevistas: number;
  despesasPrevistas: number;
  saldoMes: number;
  saldoAcumulado: number;
}

const calculateProjection = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  monthsToProject: number = 12
): MonthlyProjection[] => {
  const now = new Date();
  const projections: MonthlyProjection[] = [];
  let saldoAcumulado = 0; // Saldo inicial é 0 para a projeção, assumindo que o saldo real é gerenciado separadamente.

  // 1. Filtrar transações relevantes (ativas e do workspace)
  const activeTransactions = transactions.filter(t => 
    t.origem === workspace && 
    !t.deletado &&
    t.recorrencia_ativa !== false
  );

  // 2. Calcular o saldo real até o final do mês atual (para iniciar a projeção)
  const currentMonthEnd = endOfMonth(now);
  const currentMonthTransactions = activeTransactions.filter(t => 
    new Date(t.data) <= currentMonthEnd
  );

  const entradasRealizadas = currentMonthTransactions
    .filter(t => t.tipo === 'entrada' && t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saidasPagas = currentMonthTransactions
    .filter(t => t.tipo === 'saida' && t.status === 'realizada')
    .reduce((sum, t) => sum + t.valor, 0);
    
  saldoAcumulado = entradasRealizadas - saidasPagas;

  // 3. Iterar pelos próximos meses
  for (let i = 0; i < monthsToProject; i++) {
    const monthDate = addMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthLabel = format(monthDate, 'MMM/yyyy', { locale: ptBR });

    // Filtrar transações previstas/recorrentes para este mês
    const monthTransactions = activeTransactions.filter(t => {
      const transactionDate = new Date(t.data);
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
    });

    const receitasPrevistas = monthTransactions
      .filter(t => t.tipo === 'entrada' && t.status !== 'realizada')
      .reduce((sum, t) => sum + t.valor, 0);

    const despesasPrevistas = monthTransactions
      .filter(t => t.tipo === 'saida' && t.status !== 'realizada')
      .reduce((sum, t) => sum + t.valor, 0);
      
    // Se for o mês atual, incluir as transações realizadas no cálculo do mês
    let receitasMes = receitasPrevistas;
    let despesasMes = despesasPrevistas;
    
    if (i === 0) {
        receitasMes += entradasRealizadas;
        despesasMes += saidasPagas;
    }

    const saldoMes = receitasMes - despesasMes;
    
    // O saldo acumulado é o saldo do mês anterior + o saldo projetado do mês atual
    // Nota: Para o primeiro mês (i=0), o saldo acumulado já foi inicializado com o saldo real.
    if (i > 0) {
        saldoAcumulado += saldoMes;
    }

    projections.push({
      monthLabel,
      monthStart,
      monthEnd,
      receitasPrevistas: receitasMes,
      despesasPrevistas: despesasMes,
      saldoMes,
      saldoAcumulado,
    });
  }

  return projections;
};

export const useCashFlowProjection = (
  transactions: Transaction[],
  workspace: 'PF' | 'PJ',
  months: number = 12
) => {
  const projection = useMemo(() => {
    return calculateProjection(transactions, workspace, months);
  }, [transactions, workspace, months]);

  return { projection };
};