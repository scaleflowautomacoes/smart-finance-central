import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useFutureProjections } from '@/hooks/useFutureProjections';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingSpinner from './LoadingSpinner';

interface DashboardFutureProjectionProps {
  workspace: 'PF' | 'PJ';
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const DashboardFutureProjection: React.FC<DashboardFutureProjectionProps> = ({ workspace }) => {
  const { projections, loading, loadProjections } = useFutureProjections();

  useEffect(() => {
    // Carrega projeções para 90 dias
    loadProjections(90);
  }, [loadProjections]);
  
  const workspaceProjections = useMemo(() => {
    return projections.filter(p => p.origem === workspace);
  }, [projections, workspace]);

  const summary = workspaceProjections.reduce((acc, p) => {
    if (p.tipo === 'entrada') {
      acc.entradas += p.valor;
    } else {
      acc.saidas += p.valor;
    }
    return acc;
  }, { entradas: 0, saidas: 0 });
  
  const saldo = summary.entradas - summary.saidas;

  return (
    <Card className="shadow-lg border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2 text-purple-700">
          <Clock className="h-5 w-5" />
          <span>Projeção Futura (90 dias) - {workspace}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <LoadingSpinner size="sm" text="Calculando..." />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-sm font-medium">
              <div className="text-center">
                <p className="text-green-600">{formatCurrency(summary.entradas)}</p>
                <p className="text-muted-foreground text-xs">Entradas</p>
              </div>
              <div className="text-center">
                <p className="text-red-600">{formatCurrency(summary.saidas)}</p>
                <p className="text-muted-foreground text-xs">Saídas</p>
              </div>
              <div className="text-center">
                <p className={`font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {formatCurrency(saldo)}
                </p>
                <p className="text-muted-foreground text-xs">Saldo Projetado</p>
              </div>
            </div>
            
            <div className="border-t pt-3 space-y-2 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-semibold text-muted-foreground">Próximos 5 Eventos:</h4>
              {workspaceProjections.slice(0, 5).map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    {p.tipo === 'entrada' ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                    <span className="font-medium">{p.nome}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${p.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(p.valor)}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(p.data), 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                </div>
              ))}
              {workspaceProjections.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-2">
                  Nenhuma transação futura prevista.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardFutureProjection;