import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Category } from '@/types/financial';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, DollarSign, Home, ShoppingCart, TrendingUp, Car, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface DashboardRecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  workspace: 'PF' | 'PJ';
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getIconForCategory = (categoryName: string) => {
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('salário') || lowerName.includes('bônus')) return TrendingUp;
  if (lowerName.includes('aluguel') || lowerName.includes('moradia')) return Home;
  if (lowerName.includes('alimentação') || lowerName.includes('mercado')) return ShoppingCart;
  if (lowerName.includes('investimento') || lowerName.includes('rendimento')) return DollarSign;
  if (lowerName.includes('transporte') || lowerName.includes('combustível')) return Car;
  return FolderOpen;
};

const DashboardRecentTransactions: React.FC<DashboardRecentTransactionsProps> = ({ 
  transactions, 
  categories, 
  workspace 
}) => {
  const recentTransactions = useMemo(() => {
    return transactions
      .filter(t => t.origem === workspace && !t.deletado && t.status === 'realizada')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [transactions, workspace]);
  
  const getCategoryName = (id?: string) => {
    return categories.find(c => c.id === id)?.nome || 'Geral';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Últimas Transações</CardTitle>
        <Link to="/" className="text-sm text-primary hover:underline flex items-center space-x-1">
          <span>Ver todas</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhuma transação recente realizada.
            </div>
          ) : (
            recentTransactions.map((t) => {
              const categoryName = getCategoryName(t.categoria_id);
              const Icon = getIconForCategory(categoryName);
              const isIncome = t.tipo === 'entrada';
              
              return (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.data), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      variant={isIncome ? 'default' : 'destructive'} 
                      className={`text-xs px-2 py-0.5 ${isIncome ? 'bg-green-500 hover:bg-green-500' : 'bg-red-500 hover:bg-red-500'}`}
                    >
                      {categoryName}
                    </Badge>
                    <span className={`font-bold text-base ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'} {formatCurrency(t.valor)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardRecentTransactions;