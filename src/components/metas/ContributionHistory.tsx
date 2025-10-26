import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal } from '@/types/financial';
import { List, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContributionHistoryProps {
  goal: Goal;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// Simulação de histórico de contribuições
const generateMockHistory = (goal: Goal) => {
  const history = [];
  let remainingAmount = goal.current_amount;
  const totalContributions = Math.floor(goal.current_amount / 500) + 1; // Simula pelo menos 1 contribuição
  
  for (let i = 0; i < totalContributions; i++) {
    const amount = Math.min(remainingAmount, Math.random() * 500 + 100);
    remainingAmount -= amount;
    
    history.push({
      id: i.toString(),
      amount: amount,
      date: format(new Date(goal.created_at).getTime() + i * 86400000 * 15, 'dd/MM/yyyy', { locale: ptBR }), // A cada 15 dias
    });
    
    if (remainingAmount <= 0) break;
  }
  
  // Adicionar a contribuição final se houver saldo restante
  if (remainingAmount > 0) {
    history.push({
      id: totalContributions.toString(),
      amount: remainingAmount,
      date: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
    });
  }
  
  return history.reverse(); // Mostrar mais recente primeiro
};

const ContributionHistory: React.FC<ContributionHistoryProps> = ({ goal }) => {
  const historyData = generateMockHistory(goal);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <List className="h-5 w-5" />
          <span>Histórico de Contribuições</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto p-4">
        {historyData.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Nenhuma contribuição registrada ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {historyData.map((item, index) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContributionHistory;