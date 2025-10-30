import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Debt } from '@/types/financial';
import { Scale, DollarSign, Calendar, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button'; // Adicionado

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onPayInstallment: (debt: Debt) => void;
  loading: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const DebtCard: React.FC<DebtCardProps> = ({ debt, onEdit, onPayInstallment, loading }) => {
  const getStatusBadge = (status: Debt['status']) => {
    switch (status) {
      case 'active': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ativa</Badge>;
      case 'paid': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paga</Badge>;
      case 'late': return <Badge variant="destructive">Atrasada</Badge>;
      default: return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const installmentValue = debt.total_amount / debt.installments_total;
  const progress = (debt.installments_paid / debt.installments_total) * 100;

  return (
    <Card className={`shadow-lg ${debt.status === 'late' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{debt.name}</CardTitle>
          {getStatusBadge(debt.status)}
        </div>
        <p className="text-sm text-muted-foreground">{debt.creditor} ({debt.workspace})</p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
              <DollarSign className="h-3 w-3" />
              <span>Valor Restante</span>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(debt.remaining_amount)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Próximo Vencimento</span>
            </div>
            <div className="text-xl font-bold text-gray-700">
              {format(new Date(debt.due_date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          </div>
        </div>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Parcelas: {debt.installments_paid}/{debt.installments_total}</span>
            <span>{progress.toFixed(0)}% Pago</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Detalhes */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <div className="flex justify-between">
            <span>Valor da Parcela (Estimado):</span>
            <span className="font-medium text-gray-700">{formatCurrency(installmentValue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Juros Anual:</span>
            <span className="font-medium text-gray-700 flex items-center">
              <Percent className="h-3 w-3 mr-1" />
              {debt.interest_rate.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-2 pt-2">
          {debt.status === 'active' && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onPayInstallment(debt)}
              disabled={loading}
            >
              {loading ? 'Pagando...' : 'Pagar Parcela'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onEdit(debt)} disabled={loading}>
            Detalhes/Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtCard;