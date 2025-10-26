
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pause, Play, X, MoreVertical, Calendar } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { useRecurrenceManager } from '@/hooks/useRecurrenceManager';

interface RecurrenceManagerProps {
  transaction: Transaction;
  onUpdate: () => void;
}

const RecurrenceManager: React.FC<RecurrenceManagerProps> = ({ transaction, onUpdate }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'pausar' | 'reativar' | 'cancelar' | null>(null);
  const { manageRecurrence, loading } = useRecurrenceManager();

  const handleAction = (action: 'pausar' | 'reativar' | 'cancelar') => {
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!actionType) return;
    
    const success = await manageRecurrence(transaction.id, actionType);
    if (success) {
      onUpdate();
    }
    setShowDialog(false);
    setActionType(null);
  };

  const getActionText = () => {
    switch (actionType) {
      case 'pausar': return 'pausar';
      case 'reativar': return 'reativar';
      case 'cancelar': return 'cancelar';
      default: return '';
    }
  };

  const getRecurrenceStatus = () => {
    if (!transaction.recorrencia_ativa) return 'Pausada';
    return 'Ativa';
  };

  const getStatusColor = () => {
    if (!transaction.recorrencia_ativa) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (!transaction.is_recorrente) return null;

  return (
    <>
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Gerenciar Recorrência</span>
            </div>
            <Badge className={getStatusColor()}>
              {getRecurrenceStatus()}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <p><strong>Frequência:</strong> {transaction.recorrencia_tipo}</p>
            <p><strong>Total de ocorrências:</strong> {transaction.recorrencia_total_ocorrencias}</p>
            <p><strong>Ocorrência atual:</strong> {transaction.recorrencia_ocorrencia_atual}</p>
          </div>
          
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {transaction.recorrencia_ativa ? (
                  <DropdownMenuItem onClick={() => handleAction('pausar')}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar Recorrência
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleAction('reativar')}>
                    <Play className="h-4 w-4 mr-2" />
                    Reativar Recorrência
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleAction('cancelar')}
                  className="text-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Recorrência
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {getActionText()} esta recorrência? 
              {actionType === 'cancelar' && ' Todas as transações futuras serão canceladas.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecurrenceManager;
