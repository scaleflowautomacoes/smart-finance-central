import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    borderColor: 'border-emerald-500/20',
    valueColor: 'text-emerald-700 dark:text-emerald-300',
    icon: TrendingUp,
    background: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  },
  expense: {
    borderColor: 'border-rose-500/20',
    valueColor: 'text-rose-700 dark:text-rose-300',
    icon: TrendingDown,
    background: 'from-rose-500/10 via-rose-500/5 to-transparent',
  },
  balance: {
    borderColor: 'border-sky-500/20',
    valueColor: 'text-sky-700 dark:text-sky-300',
    icon: Minus,
    background: 'from-sky-500/10 via-sky-500/5 to-transparent',
  },
  warning: {
    borderColor: 'border-amber-500/20',
    valueColor: 'text-amber-700 dark:text-amber-300',
    icon: Minus,
    background: 'from-amber-500/10 via-amber-500/5 to-transparent',
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
    <Card variant="soft" className={cn('relative min-h-[8.5rem] overflow-hidden border border-border/60 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.3)]', styles.borderColor, className)}>
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', styles.background)} />
      <CardHeader className="pb-2.5 pt-5">
        <CardTitle className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className={cn('text-2xl font-semibold leading-tight tracking-tight lg:text-[1.75rem]', styles.valueColor)}>
          {formatCurrency(value)}
          {suffix && <span className="ml-1 text-sm font-normal leading-5">{suffix}</span>}
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
