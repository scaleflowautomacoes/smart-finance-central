import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  type: 'critical' | 'warning' | 'info' | 'healthy';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const typeConfig = {
  critical: {
    icon: AlertCircle,
    containerClass: 'border-rose-500/15 bg-gradient-to-br from-rose-500/8 via-rose-500/4 to-transparent',
    iconClass: 'text-rose-500',
    titleClass: 'text-rose-700 dark:text-rose-300',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'border-amber-500/15 bg-gradient-to-br from-amber-500/8 via-amber-500/4 to-transparent',
    iconClass: 'text-amber-500',
    titleClass: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    icon: Info,
    containerClass: 'border-sky-500/15 bg-gradient-to-br from-sky-500/8 via-sky-500/4 to-transparent',
    iconClass: 'text-sky-500',
    titleClass: 'text-sky-700 dark:text-sky-300',
  },
  healthy: {
    icon: CheckCircle,
    containerClass: 'border-emerald-500/15 bg-gradient-to-br from-emerald-500/8 via-emerald-500/4 to-transparent',
    iconClass: 'text-emerald-500',
    titleClass: 'text-emerald-700 dark:text-emerald-300',
  },
};

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  description,
  action,
  className,
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card variant="soft" className={cn(
      'shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]',
      config.containerClass,
      className
    )}>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-4.5 w-4.5 shrink-0 mt-0.5', config.iconClass)} />
          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-sm', config.titleClass)}>
              {title}
            </p>
            <p className="text-sm leading-6 text-muted-foreground mt-1">
              {description}
            </p>
          </div>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="shrink-0"
            >
              {action.label}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
