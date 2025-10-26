
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Calendar, AlertCircle, CheckCircle, Clock, Pause } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';

interface RecurrenceStatusProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  onRefresh: () => void;
}

const RecurrenceStatus: React.FC<RecurrenceStatusProps> = ({ 
  transactions, 
  workspace, 
  onRefresh 
}) => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  const workspaceTransactions = transactions.filter(t => 
    t.origem === workspace && 
    !t.deletado
  );

  // Transações recorrentes (pais)
  const parentRecurrences = workspaceTransactions.filter(t => 
    t.is_recorrente && 
    !t.recorrencia_transacao_pai_id
  );

  // Transações filhas geradas
  const childTransactions = workspaceTransactions.filter(t => 
    t.recorrencia_transacao_pai_id
  );

  // Status das recorrências
  const activeRecurrences = parentRecurrences.filter(t => t.recorrencia_ativa !== false);
  const pausedRecurrences = parentRecurrences.filter(t => t.recorrencia_ativa === false);
  const completedRecurrences = parentRecurrences.filter(t => 
    t.recorrencia_ocorrencia_atual === t.recorrencia_total_ocorrencias
  );

  // Transações futuras previstas
  const futureTransactions = childTransactions.filter(t => 
    t.status === 'prevista' && 
    new Date(t.data) > new Date()
  );

  // Transações vencidas por recorrência
  const overdueTransactions = childTransactions.filter(t => 
    t.status === 'vencida'
  );

  const handleRegenerateRecurrences = async () => {
    try {
      setLoading(true);
      
      console.log('Iniciando regeneração de recorrências...');
      
      const { error } = await supabase.rpc('gerar_proximas_transacoes_recorrentes');
      
      if (error) {
        console.error('Erro na função RPC:', error);
        throw error;
      }

      showSuccess('Transações recorrentes regeneradas com sucesso!');
      
      // Aguardar e recarregar dados
      setTimeout(() => {
        onRefresh();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao regenerar recorrências:', error);
      showError('Erro ao regenerar transações recorrentes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (parentRecurrences.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50/50">
        <CardContent className="py-4">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Nenhuma transação recorrente configurada para {workspace}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Status das Recorrências - {workspace}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateRecurrences}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Processando...' : 'Regenerar'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-600">Ativas</span>
            <div className="flex items-center space-x-1">
              <Badge variant="default" className="w-fit mt-1">
                {activeRecurrences.length}
              </Badge>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-600">Pausadas</span>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="w-fit mt-1">
                {pausedRecurrences.length}
              </Badge>
              {pausedRecurrences.length > 0 && <Pause className="h-3 w-3 text-yellow-500" />}
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-600">Futuras</span>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="w-fit mt-1">
                {futureTransactions.length}
              </Badge>
              <Clock className="h-3 w-3 text-blue-500" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-600">Concluídas</span>
            <div className="flex items-center space-x-1">
              <Badge className="bg-green-100 text-green-800 w-fit mt-1">
                {completedRecurrences.length}
              </Badge>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
          </div>
        </div>

        {/* Informações Detalhadas */}
        <div className="space-y-2">
          {/* Alertas */}
          {overdueTransactions.length > 0 && (
            <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50 p-2 rounded">
              <AlertCircle className="h-3 w-3" />
              <span>{overdueTransactions.length} transações recorrentes estão vencidas</span>
            </div>
          )}

          {pausedRecurrences.length > 0 && (
            <div className="flex items-center space-x-2 text-amber-600 text-xs bg-amber-50 p-2 rounded">
              <Pause className="h-3 w-3" />
              <span>{pausedRecurrences.length} recorrências estão pausadas</span>
            </div>
          )}

          {/* Resumo das Recorrências Ativas */}
          {activeRecurrences.length > 0 && (
            <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
              <div className="font-medium mb-1">Recorrências Ativas:</div>
              <div className="space-y-1">
                {activeRecurrences.slice(0, 3).map((recurrence) => {
                  const childCount = childTransactions.filter(t => 
                    t.recorrencia_transacao_pai_id === recurrence.id
                  ).length;
                  
                  return (
                    <div key={recurrence.id} className="flex justify-between">
                      <span className="truncate">{recurrence.nome}</span>
                      <span>
                        {childCount + 1}/{recurrence.recorrencia_total_ocorrencias} 
                        ({recurrence.recorrencia_tipo})
                      </span>
                    </div>
                  );
                })}
                {activeRecurrences.length > 3 && (
                  <div className="text-center text-gray-500">
                    +{activeRecurrences.length - 3} outras recorrências
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estatísticas de Geração */}
          <div className="text-xs text-gray-600 border-t pt-2">
            <div className="flex justify-between">
              <span>Total de transações geradas:</span>
              <span className="font-medium">{childTransactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Valor total das futuras:</span>
              <span className="font-medium">
                R$ {futureTransactions.reduce((sum, t) => sum + t.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurrenceStatus;
