import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/financial';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Briefcase } from 'lucide-react';
import { formatCurrency, CHART_COLORS } from '@/utils/chartColors';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashFlowAreaProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  startDate: Date;
  endDate: Date;
}

const CashFlowArea: React.FC<CashFlowAreaProps> = ({ transactions, workspace, startDate, endDate }) => {
  const chartData = useMemo(() => {
    const filteredTransactions = transactions.filter(t => {
      if (t.origem !== workspace || t.deletado || t.status !== 'realizada') return false;
      const transactionDate = new Date(t.data);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const monthlyData: { [key: string]: { receitas: number; despesas: number } } = {};
    
    let current = startOfMonth(startDate);
    const end = endOfMonth(endDate);

    while (current <= end) {
      const key = format(current, 'MMM/yy', { locale: ptBR });
      monthlyData[key] = { receitas: 0, despesas: 0 };
      current = startOfMonth(new Date(current.setMonth(current.getMonth() + 1)));
    }

    filteredTransactions.forEach(t => {
      const monthKey = format(new Date(t.data), 'MMM/yy', { locale: ptBR });
      if (monthlyData[monthKey]) {
        if (t.tipo === 'entrada') {
          monthlyData[monthKey].receitas += t.valor;
        } else {
          monthlyData[monthKey].despesas += t.valor;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      Receitas: data.receitas,
      Despesas: data.despesas,
    }));
  }, [transactions, workspace, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-900 ml-2">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Fluxo de Caixa Realizado (Receitas vs Despesas)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 p-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.neutral[200]} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Receitas" 
                stackId="1" 
                stroke={CHART_COLORS.income.main} 
                fill={CHART_COLORS.income.light} 
                name="Receitas"
              />
              <Area 
                type="monotone" 
                dataKey="Despesas" 
                stackId="1" 
                stroke={CHART_COLORS.expense.main} 
                fill={CHART_COLORS.expense.light} 
                name="Despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Nenhuma transação realizada no período para análise de fluxo.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowArea;