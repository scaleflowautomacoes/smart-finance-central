import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Investment } from '@/types/financial';
import { DollarSign, TrendingUp, TrendingDown, Edit, Trash2, RefreshCw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvestmentCardProps {
  investment: Investment;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
  onUpdateAmount: (id: string, amount: number) => Promise<void>;
  loading: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment, onEdit, onDelete, onUpdateAmount, loading }) => {
  const [newAmount, setNewAmount] = useState(investment.current_amount.toString());
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  
  const profitLoss = investment.current_amount - investment.initial_amount;
  const daysHeld = differenceInDays(new Date(), new Date(investment.purchase_date));
  
  // Rentabilidade Total (%)
  const totalReturn = investment.initial_amount > 0 ? (profitLoss / investment.initial_amount) * 100 : 0;
  
  // Rentabilidade Anualizada (simplificada)
  const annualizedReturn = daysHeld > 0 ? (totalReturn / daysHeld) * 365 : 0;

  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  const handleUpdateSubmit = async () => {
    const amount = parseFloat(newAmount);
    if (amount >= 0) {
      await onUpdateAmount(investment.id, amount);
      setIsUpdateOpen(false);
    }
  };

  return (
    <Card className={`shadow-lg ${profitLoss >= 0 ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{investment.name}</CardTitle>
          <Badge variant="secondary">{investment.type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {investment.workspace} - {format(new Date(investment.purchase_date), 'dd/MM/yyyy', { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Valores */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Valor Atual</div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(investment.current_amount)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Lucro/Prejuízo</div>
            <div className={`text-xl font-bold ${getProfitColor(profitLoss)}`}>
              {formatCurrency(profitLoss)}
            </div>
          </div>
        </div>

        {/* Rentabilidade */}
        <div className="grid grid-cols-2 gap-4 text-xs border-t pt-3">
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground">Retorno Total</div>
            <div className={`font-bold text-lg ${getProfitColor(totalReturn)}`}>
              {totalReturn.toFixed(2)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground">Retorno Anualizado</div>
            <div className={`font-bold text-lg ${getProfitColor(annualizedReturn)}`}>
              {annualizedReturn.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-2 pt-2">
          <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar Valor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atualizar Valor Atual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="new-amount">Novo Valor Atual (R$)</Label>
                <Input
                  id="new-amount"
                  type="number"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0,00"
                />
                <Button onClick={handleUpdateSubmit} disabled={!newAmount || loading}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="sm" onClick={() => onEdit(investment)} disabled={loading}>
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
                  Tem certeza que deseja excluir o investimento "{investment.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(investment.id)}>
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

export default InvestmentCard;