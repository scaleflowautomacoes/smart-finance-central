import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, CheckCircle } from "lucide-react";
import { FinancialMetrics } from "@/hooks/useFinancialCalculations";

interface EnhancedMetricsCardsProps {
  metrics: FinancialMetrics;
  workspace: 'PF' | 'PJ';
}

export function EnhancedMetricsCards({ metrics, workspace }: EnhancedMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSaldoStatus = (saldo: number) => {
    if (saldo > 0) return { color: 'bg-green-500', icon: CheckCircle, text: 'Positivo' };
    if (saldo < 0) return { color: 'bg-red-500', icon: AlertCircle, text: 'Negativo' };
    return { color: 'bg-gray-500', icon: DollarSign, text: 'Neutro' };
  };

  const saldoRealStatus = getSaldoStatus(metrics.saldoReal);
  const saldoProjetadoStatus = getSaldoStatus(metrics.saldoProjetado);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Entradas */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.totalEntradas)}
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">
                  {formatCurrency(metrics.entradasRealizadas)}
                </div>
                <p className="text-xs text-muted-foreground">Realizadas</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatCurrency(metrics.entradasPrevistas)}
                </div>
                <p className="text-xs text-muted-foreground">Previstas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saídas */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saídas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(metrics.totalSaidas)}
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">
                  {formatCurrency(metrics.saidasRealizadas)}
                </div>
                <p className="text-xs text-muted-foreground">Realizadas</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatCurrency(metrics.saidasPrevistas)}
                </div>
                <p className="text-xs text-muted-foreground">Previstas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Real */}
      <Card className={`border-l-4 border-l-${saldoRealStatus.color.replace('bg-', '')}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Real</CardTitle>
          <saldoRealStatus.icon className={`h-4 w-4 ${saldoRealStatus.color.replace('bg-', 'text-')}`} />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.saldoReal)}
            </div>
            <Badge 
              variant={metrics.saldoReal >= 0 ? 'default' : 'destructive'}
              className="text-xs"
            >
              {saldoRealStatus.text}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Entradas realizadas - Saídas realizadas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Projetado */}
      <Card className={`border-l-4 border-l-${saldoProjetadoStatus.color.replace('bg-', '')}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
          <Target className={`h-4 w-4 ${saldoProjetadoStatus.color.replace('bg-', 'text-')}`} />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.saldoProjetado)}
            </div>
            <Badge 
              variant={metrics.saldoProjetado >= 0 ? 'default' : 'destructive'}
              className="text-xs"
            >
              {saldoProjetadoStatus.text}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Projeção total do período
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}