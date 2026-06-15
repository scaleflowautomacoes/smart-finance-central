import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  variation?: number;
  variant: 'income' | 'expense' | 'balance' | 'warning';
  suffix?: string;
  className?: string;
}

const variantStyles = {
  income: {
    borderColor: 'border-l-success',
    valueColor: 'text-success dark:text-green-400',
    icon: TrendingUp,
  },
  expense: {
    borderColor: 'border-l-error',
    valueColor: 'text-error dark:text-red-400',
    icon: TrendingDown,
  },
  balance: {
    borderColor: 'border-l-primary',
    valueColor: 'text-primary dark:text-blue-400',
    icon: Minus,
  },
  warning: {
    borderColor: 'border-l-warning',
    valueColor: 'text-warning dark:text-yellow-400',
    icon: Minus,
  },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  variation,
  variant,
  suffix,
  className,
}) => {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <Card className={cn('border-0 shadow-md bg-card', styles.borderColor, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', styles.valueColor)}>
          {formatCurrency(value)}
          {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
        </div>
        {variation !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {variation > 0 ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : variation < 0 ? (
              <TrendingDown className="h-3 w-3 text-error" />
            ) : (
              <Minus className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={cn(
              'text-xs font-medium',
              variation > 0 ? 'text-success' : variation < 0 ? 'text-error' : 'text-muted-foreground'
            )}>
              {formatPercentage(variation)}
            </span>
            <span className="text-xs text-muted-foreground">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};