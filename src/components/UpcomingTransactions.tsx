
import React, { useMemo } from 'react';
import { Calendar, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/financial';
import { format, addMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UpcomingTransactionsProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
}

const UpcomingTransactions: React.FC<UpcomingTransactionsProps> = ({
  transactions,
  workspace
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const upcomingTransactions = useMemo(() => {
    const nextMonth = addMonths(new Date(), 1);
    const startDate = startOfMonth(nextMonth);
    const endDate = endOfMonth(nextMonth);

    return transactions.filter(t => {
      if (t.deletado || t.origem !== workspace) return false;
      
      const transactionDate = new Date(t.data);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [transactions, workspace]);

  const summary = useMemo(() => {
    const entradas = upcomingTransactions.filter(t => t.tipo === 'entrada');
    const saidas = upcomingTransactions.filter(t => t.tipo === 'saida');
    
    return {
      totalEntradas: entradas.reduce((sum, t) => sum + t.valor, 0),
      totalSaidas: saidas.reduce((sum, t) => sum + t.valor, 0),
      saldoProjetado: entradas.reduce((sum, t) => sum + t.valor, 0) - saidas.reduce((sum, t) => sum + t.valor, 0)
    };
  }, [upcomingTransactions]);

  const getStatusBadge = (status: string) => {
    const variants = {
      'prevista': 'bg-yellow-100 text-yellow-800',
      'realizada': 'bg-green-100 text-green-800',
      'vencida': 'bg-red-100 text-red-800',
      'cancelada': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Próximos Vencimentos - {format(addMonths(new Date(), 1), 'MMMM yyyy', { locale: ptBR })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Entradas</span>
            </div>
            <div className="text-xl font-bold text-green-700">
              {formatCurrency(summary.totalEntradas)}
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Saídas</span>
            </div>
            <div className="text-xl font-bold text-red-700">
              {formatCurrency(summary.totalSaidas)}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Saldo Projetado</span>
            </div>
            <div className={`text-xl font-bold ${summary.saldoProjetado >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(summary.saldoProjetado)}
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-3">
          {upcomingTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação prevista para o próximo mês.</p>
            </div>
          ) : (
            upcomingTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{transaction.nome}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(transaction.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(transaction.status)}
                  <div className={`font-medium ${
                    transaction.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaction.valor)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTransactions;
