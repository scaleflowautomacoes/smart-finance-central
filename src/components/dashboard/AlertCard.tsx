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
    containerClass: 'bg-error/5 border-error/20',
    iconClass: 'text-error',
    titleClass: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-warning/5 border-warning/20',
    iconClass: 'text-warning',
    titleClass: 'text-warning',
  },
  info: {
    icon: Info,
    containerClass: 'bg-primary/5 border-primary/20',
    iconClass: 'text-primary',
    titleClass: 'text-primary',
  },
  healthy: {
    icon: CheckCircle,
    containerClass: 'bg-success/5 border-success/20',
    iconClass: 'text-success',
    titleClass: 'text-success',
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
    <Card className={cn(
      'border shadow-sm',
      config.containerClass,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconClass)} />
          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-sm', config.titleClass)}>
              {title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
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