import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Debt } from '@/types/financial';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingDown, Scale } from 'lucide-react';
import { CHART_COLORS, formatCurrency } from '@/utils/chartColors';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from 'next-themes';

interface DebtChartProps {
  debt: Debt;
}

const DebtChart: React.FC<DebtChartProps> = ({ debt }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const textColor = isDarkMode ? CHART_COLORS.neutral[300] : CHART_COLORS.neutral[600];
  const gridColor = isDarkMode ? CHART_COLORS.neutral[700] : CHART_COLORS.neutral[200];

  const chartData = useMemo(() => {
    const data = [];
    let remaining = debt.remaining_amount;
    let paid = debt.installments_paid;
    const totalInstallments = debt.installments_total;
    const installmentValue = debt.total_amount / totalInstallments;
    const startDate = new Date(debt.due_date);

    // Adicionar o ponto inicial (saldo atual)
    data.push({
      month: format(startDate, 'MMM/yy', { locale: ptBR }),
      saldo: remaining,
      parcela: 0,
    });

    // Simular pagamentos futuros
    for (let i = paid; i < totalInstallments; i++) {
      const monthDate = addMonths(startDate, i);
      
      // Simplificação: assumimos que o pagamento reduz o saldo pelo valor da parcela (ignorando juros compostos na simulação visual)
      remaining = Math.max(0, remaining - installmentValue);
      
      data.push({
        month: format(monthDate, 'MMM/yy', { locale: ptBR }),
        saldo: remaining,
        parcela: installmentValue,
      });
      
      if (remaining === 0) break;
    }
    
    return data;
  }, [debt]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const saldo = payload.find((p: any) => p.dataKey === 'saldo');
      return (
        <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {saldo && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Saldo Devedor:</span>
              <span className="font-bold text-red-600 ml-2">
                {formatCurrency(saldo.value)}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Projeção de Quitação
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingDown className="h-5 w-5 text-red-600" />
          <span>Projeção de Redução do Saldo Devedor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 p-6">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: textColor, fontSize: 12 }}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="saldo" 
                stroke={CHART_COLORS.expense.main} 
                fill={CHART_COLORS.expense.light} 
                name="Saldo Devedor"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Scale className="w-10 h-10 mx-auto mb-3" />
            <p>Dados insuficientes para projeção de dívida.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtChart;