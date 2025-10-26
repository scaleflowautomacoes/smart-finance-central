
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Repeat, Calendar, Clock, Pause } from 'lucide-react';
import { Transaction } from '@/types/financial';

interface RecurrenceIndicatorProps {
  transaction: Transaction;
}

const RecurrenceIndicator: React.FC<RecurrenceIndicatorProps> = ({ transaction }) => {
  if (!transaction.is_recorrente && !transaction.recorrencia_transacao_pai_id) {
    return null;
  }

  const isParent = transaction.is_recorrente && transaction.recorrencia_total_ocorrencias;
  const isChild = transaction.recorrencia_transacao_pai_id;

  const getRecurrenceLabel = (tipo: string) => {
    switch (tipo) {
      case 'diaria': return 'Diária';
      case 'semanal': return 'Semanal';
      case 'quinzenal': return 'Quinzenal';
      case 'mensal': return 'Mensal';
      case 'anual': return 'Anual';
      default: return 'Recorrente';
    }
  };

  const getProgressText = () => {
    if (transaction.recorrencia_ocorrencia_atual && transaction.recorrencia_total_ocorrencias) {
      return `${transaction.recorrencia_ocorrencia_atual}/${transaction.recorrencia_total_ocorrencias}`;
    }
    return '';
  };

  if (isParent) {
    const isPaused = !transaction.recorrencia_ativa;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className={`flex items-center space-x-1 ${
                isPaused ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {isPaused ? <Pause className="h-3 w-3" /> : <Repeat className="h-3 w-3" />}
                <span>{getRecurrenceLabel(transaction.recorrencia_tipo || '')}</span>
              </Badge>
              {getProgressText() && (
                <Badge variant="secondary" className="text-xs">
                  {getProgressText()}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">Transação Recorrente {isPaused ? '(Pausada)' : '(Ativa)'}</p>
              <p>Frequência: {getRecurrenceLabel(transaction.recorrencia_tipo || '')}</p>
              <p>Progresso: {getProgressText()}</p>
              <p>Status: {transaction.recorrencia_ativa ? 'Ativa' : 'Pausada'}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isChild) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-gray-50 border-gray-200 text-gray-600 flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Auto</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">Transação Automática</p>
              <p>Gerada por recorrência</p>
              <p>Status: {transaction.recorrencia_ativa ? 'Ativa' : 'Pausada'}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
};

export default RecurrenceIndicator;
