import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  label: string;
  className?: string;
}

const statusConfig = {
  healthy: {
    badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  warning: {
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300',
    dotClass: 'bg-amber-500',
  },
  critical: {
    badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300',
    dotClass: 'bg-rose-500',
  },
  neutral: {
    badgeClass: 'bg-muted/80 text-muted-foreground border-border/70',
    dotClass: 'bg-muted-foreground',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
}) => {
  const config = statusConfig[status];

  return (
    <Badge 
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        config.badgeClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {label}
    </Badge>
  );
};
