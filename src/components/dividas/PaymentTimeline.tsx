import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Debt } from '@/types/financial';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentTimelineProps {
  debt: Debt;
}

const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ debt }) => {
  const totalInstallments = debt.installments_total;
  const paidInstallments = debt.installments_paid;
  const installmentValue = debt.total_amount / totalInstallments;

  const generateTimeline = () => {
    const timeline = [];
    const startDate = new Date(debt.due_date);
    
    for (let i = 1; i <= totalInstallments; i++) {
      const isPaid = i <= paidInstallments;
      const isCurrent = i === paidInstallments + 1 && !isPaid;
      
      // Calcular a data de vencimento para a parcela i
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i - 1);
      
      let status: 'paid' | 'pending' | 'current' | 'late' = 'pending';
      if (isPaid) {
        status = 'paid';
      } else if (isCurrent) {
        status = 'current';
      } else if (dueDate < new Date() && !isPaid) {
        status = 'late';
      }

      timeline.push({
        number: i,
        date: format(dueDate, 'dd/MM/yyyy', { locale: ptBR }),
        status,
        amount: installmentValue,
      });
    }
    return timeline;
  };

  const timelineData = generateTimeline();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Linha do Tempo de Pagamentos</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto p-6">
        <div className="relative border-l border-gray-200 space-y-6">
          {timelineData.map((item, index) => (
            <div key={index} className="relative ml-6">
              <span className={`absolute -left-3.5 top-0 h-7 w-7 rounded-full flex items-center justify-center ${
                item.status === 'paid' ? 'bg-green-500 text-white' :
                item.status === 'current' ? 'bg-blue-500 text-white' :
                item.status === 'late' ? 'bg-red-500 text-white' :
                'bg-gray-100 text-gray-500 border border-gray-300'
              }`}>
                {item.status === 'paid' ? <CheckCircle className="h-4 w-4" /> :
                 item.status === 'current' ? <Clock className="h-4 w-4" /> :
                 item.status === 'late' ? <XCircle className="h-4 w-4" /> :
                 <span className="text-xs font-medium">{item.number}</span>}
              </span>
              <div className="flex justify-between items-center bg-card p-3 rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-sm">
                    Parcela {item.number} de {totalInstallments}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vencimento: {item.date}
                  </p>
                </div>
                <div className={`font-bold text-sm ${
                  item.status === 'paid' ? 'text-green-600' : 'text-gray-800'
                }`}>
                  R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTimeline;