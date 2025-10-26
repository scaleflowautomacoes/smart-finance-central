import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FinancialMetrics } from "@/hooks/useFinancialCalculations";
import { Transaction } from "@/types/financial";
import { CalendarDays, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface FinancialSummaryProps {
  metrics: FinancialMetrics;
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
}

export function FinancialSummary({ metrics, transactions, workspace }: FinancialSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular estatísticas das transações
  const today = new Date();
  const vencidas = transactions.filter(t => 
    t.origem === workspace && 
    t.status === 'vencida' && 
    !t.deletado && 
    t.recorrencia_ativa !== false
  );
  
  const proximasVencer = transactions.filter(t => {
    const transactionDate = new Date(t.data);
    const diffDays = Math.ceil((transactionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return t.origem === workspace && 
           t.status === 'prevista' && 
           !t.deletado && 
           t.recorrencia_ativa !== false && 
           diffDays <= 7 && 
           diffDays >= 0;
  });

  const realizadas = transactions.filter(t => 
    t.origem === workspace && 
    t.status === 'realizada' && 
    !t.deletado && 
    t.recorrencia_ativa !== false
  );

  // Calcular progresso de receitas e despesas
  const entradaProgress = metrics.totalEntradas > 0 ? (metrics.entradasRealizadas / metrics.totalEntradas) * 100 : 0;
  const saidaProgress = metrics.totalSaidas > 0 ? (metrics.saidasRealizadas / metrics.totalSaidas) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Resumo do Período
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progresso de Entradas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Receitas Realizadas</span>
              <span className="text-sm text-muted-foreground">
                {entradaProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={entradaProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(metrics.entradasRealizadas)}</span>
              <span>{formatCurrency(metrics.totalEntradas)}</span>
            </div>
          </div>

          {/* Progresso de Saídas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Despesas Realizadas</span>
              <span className="text-sm text-muted-foreground">
                {saidaProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={saidaProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(metrics.saidasRealizadas)}</span>
              <span>{formatCurrency(metrics.totalSaidas)}</span>
            </div>
          </div>

          {/* Status do Saldo */}
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status Financeiro</span>
              <Badge variant={metrics.saldoReal >= 0 ? 'default' : 'destructive'}>
                {metrics.saldoReal >= 0 ? 'Positivo' : 'Negativo'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo atual: {formatCurrency(metrics.saldoReal)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Status das Transações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Transações Vencidas */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Vencidas</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-600">{vencidas.length}</div>
              <div className="text-xs text-red-600">
                {formatCurrency(vencidas.reduce((sum, t) => sum + t.valor, 0))}
              </div>
            </div>
          </div>

          {/* Próximas a Vencer */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Próximas (7 dias)</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-600">{proximasVencer.length}</div>
              <div className="text-xs text-yellow-600">
                {formatCurrency(proximasVencer.reduce((sum, t) => sum + t.valor, 0))}
              </div>
            </div>
          </div>

          {/* Realizadas */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Realizadas</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">{realizadas.length}</div>
              <div className="text-xs text-green-600">
                {formatCurrency(realizadas.reduce((sum, t) => sum + t.valor, 0))}
              </div>
            </div>
          </div>

          {/* Total de Transações */}
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total de Transações</span>
              <span className="text-sm font-bold">
                {transactions.filter(t => t.origem === workspace && !t.deletado && t.recorrencia_ativa !== false).length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}