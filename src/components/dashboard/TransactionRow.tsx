import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Folder,
  Home,
  ShoppingCart,
  CreditCard,
  DollarSign,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/financial';

interface TransactionRowProps {
  transaction: Transaction;
  categoryName?: string;
  onAction?: (transaction: Transaction) => void;
  className?: string;
}

const getIconForCategory = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('moradia') || name.includes('aluguel')) return Home;
  if (name.includes('alimentação') || name.includes('mercado')) return ShoppingCart;
  if (name.includes('transporte') || name.includes('combustível')) return CreditCard;
  if (name.includes('salário') || name.includes('freelance')) return DollarSign;
  return TrendingUp;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  categoryName,
  onAction,
  className,
}) => {
  const isIncome = transaction.tipo === 'entrada';
  const Icon = categoryName ? getIconForCategory(categoryName) : Folder;

  return (
    <div className={cn(
      'flex items-center justify-between p-4 hover:bg-muted/50 transition-colors',
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-full',
          isIncome ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">
            {transaction.nome}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {categoryName && (
              <Badge variant="secondary" className="text-xs">
                {categoryName}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(transaction.data)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          'font-bold text-base',
          isIncome ? 'text-success' : 'text-error'
        )}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.valor)}
        </span>
        {onAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction(transaction)}
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};