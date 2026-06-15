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
    badgeClass: 'bg-success/10 text-success border-success/20',
    dotClass: 'bg-success',
  },
  warning: {
    badgeClass: 'bg-warning/10 text-warning border-warning/20',
    dotClass: 'bg-warning',
  },
  critical: {
    badgeClass: 'bg-error/10 text-error border-error/20',
    dotClass: 'bg-error',
  },
  neutral: {
    badgeClass: 'bg-muted text-muted-foreground border-border',
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
        'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.badgeClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {label}
    </Badge>
  );
};
