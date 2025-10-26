import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/types/financial';
import { Target, Clock, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddContribution: (id: string, amount: number) => Promise<void>;
  loading: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onAddContribution, loading }) => {
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const daysRemaining = differenceInDays(new Date(goal.deadline), new Date());
  const isLate = daysRemaining < 0 && goal.status === 'active';

  const getStatusBadge = (status: Goal['status']) => {
    switch (status) {
      case 'active': return <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${isLate ? 'bg-red-100 text-red-800' : ''}`}>{isLate ? 'Atrasada' : 'Ativa'}</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluída</Badge>;
      case 'cancelled': return <Badge variant="secondary">Cancelada</Badge>;
      default: return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };
  
  const handleContributionSubmit = async () => {
    const amount = parseFloat(contributionAmount);
    if (amount > 0) {
      await onAddContribution(goal.id, amount);
      setContributionAmount('');
      setIsContributionOpen(false);
    }
  };

  return (
    <Card className={`shadow-lg ${goal.status === 'completed' ? 'border-l-4 border-l-green-500' : isLate ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{goal.name}</CardTitle>
          {getStatusBadge(goal.status)}
        </div>
        <p className="text-sm text-muted-foreground">{goal.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Prazo:</span>
            <span className={`font-medium ${isLate ? 'text-red-600' : 'text-gray-700'}`}>
              {format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Faltando:</span>
            <span className="font-medium text-blue-700">
              {formatCurrency(goal.target_amount - goal.current_amount)}
            </span>
          </div>
          {goal.category_id && (
            <div className="col-span-2 text-xs text-muted-foreground">
              Categoria Vinculada: {goal.category_id}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-2 pt-2">
          {goal.status === 'active' && (
            <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" disabled={loading}>
                  <Plus className="h-4 w-4 mr-1" />
                  Contribuir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Contribuição</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="contribution-amount">Valor da Contribuição (R$)</Label>
                  <Input
                    id="contribution-amount"
                    type="number"
                    step="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="0,00"
                  />
                  <Button onClick={handleContributionSubmit} disabled={!contributionAmount || loading}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" size="sm" onClick={() => onEdit(goal)} disabled={loading}>
            <Edit className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a meta "{goal.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(goal.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;