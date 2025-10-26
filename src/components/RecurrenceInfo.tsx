
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar, CheckCircle, Clock, Pause } from 'lucide-react';
import { Transaction } from '@/types/financial';

interface RecurrenceInfoProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  onRefresh: () => void;
  loading?: boolean;
}

const RecurrenceInfo: React.FC<RecurrenceInfoProps> = ({ 
  transactions, 
  workspace, 
  onRefresh,
  loading = false
}) => {
  const workspaceTransactions = transactions.filter(t => 
    t.origem === workspace && !t.deletado
  );

  const parentRecurrences = workspaceTransactions.filter(t => 
    t.is_recorrente && !t.recorrencia_transacao_pai_id
  );

  const activeRecurrences = parentRecurrences.filter(t => t.recorrencia_ativa !== false);
  const pausedRecurrences = parentRecurrences.filter(t => t.recorrencia_ativa === false);
  
  const futureTransactions = workspaceTransactions.filter(t => 
    t.recorrencia_transacao_pai_id && 
    t.status === 'prevista' && 
    new Date(t.data) > new Date()
  );

  if (parentRecurrences.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Nenhuma recorrência - {workspace}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Recorrências {workspace}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Carregando' : 'Atualizar'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Badge variant="default" className="text-xs">
                {activeRecurrences.length}
              </Badge>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <span className="text-muted-foreground">Ativas</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Badge variant="outline" className="text-xs">
                {futureTransactions.length}
              </Badge>
              <Clock className="h-3 w-3 text-blue-500" />
            </div>
            <span className="text-muted-foreground">Futuras</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {pausedRecurrences.length}
              </Badge>
              {pausedRecurrences.length > 0 && <Pause className="h-3 w-3 text-yellow-500" />}
            </div>
            <span className="text-muted-foreground">Pausadas</span>
          </div>
        </div>

        {futureTransactions.length > 0 && (
          <div className="text-xs bg-blue-50 p-2 rounded border-t">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor futuro:</span>
              <span className="font-medium">
                R$ {futureTransactions.reduce((sum, t) => sum + t.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecurrenceInfo;
