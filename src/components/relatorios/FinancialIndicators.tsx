import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, Zap } from 'lucide-react';
import { FinancialMetrics } from '@/hooks/useFinancialCalculations';
import { formatCurrency } from '@/utils/chartColors';

interface FinancialIndicatorsProps {
  metrics: FinancialMetrics;
}

const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({ metrics }) => {
  const { totalEntradas, totalSaidas, saldoProjetado } = metrics;

  // Margem de Lucro (Simplificada: Saldo Projetado / Receitas Totais)
  const margemLucro = totalEntradas > 0 ? (saldoProjetado / totalEntradas) * 100 : 0;
  
  // Taxa de Poupança (Simplificada: Saldo Positivo / Receitas Totais)
  const taxaPoupanca = totalEntradas > 0 && saldoProjetado > 0 ? (saldoProjetado / totalEntradas) * 100 : 0;
  
  // Relação Despesas/Receitas
  const relacaoDespesasReceitas = totalEntradas > 0 ? (totalSaidas / totalEntradas) * 100 : 0;

  const getStatusColor = (value: number, isGood: boolean) => {
    if (value > 0) return isGood ? 'text-green-600' : 'text-red-600';
    if (value < 0) return isGood ? 'text-red-600' : 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Margem de Lucro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <Percent className="h-4 w-4 text-purple-600" />
            Margem de Lucro (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getStatusColor(margemLucro, true)}`}>
            {margemLucro.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(saldoProjetado)} de saldo
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Poupança */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-blue-600" />
            Taxa de Poupança (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getStatusColor(taxaPoupanca, true)}`}>
            {taxaPoupanca.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ideal para crescimento patrimonial
          </p>
        </CardContent>
      </Card>

      {/* Relação Despesas/Receitas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <Zap className="h-4 w-4 text-red-600" />
            Despesas / Receitas (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getStatusColor(relacaoDespesasReceitas, false)}`}>
            {relacaoDespesasReceitas.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Quanto da receita é consumido por despesas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialIndicators;