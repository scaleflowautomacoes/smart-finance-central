import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusCardProps {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const priorityConfig = {
  high: {
    containerClass: 'border-error/20 bg-gradient-to-br from-error/10 via-error/5 to-transparent',
    badgeClass: 'border-error/20 bg-error/10 text-error',
    icon: AlertCircle,
    iconClass: 'text-error',
  },
  medium: {
    containerClass: 'border-warning/20 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent',
    badgeClass: 'border-warning/20 bg-warning/10 text-warning',
    icon: Clock,
    iconClass: 'text-warning',
  },
  low: {
    containerClass: 'border-success/20 bg-gradient-to-br from-success/10 via-success/5 to-transparent',
    badgeClass: 'border-success/20 bg-success/10 text-success',
    icon: TrendingUp,
    iconClass: 'text-success',
  },
};

const priorityLabels = {
  high: 'Ação Urgente',
  medium: 'Revisão Pendente',
  low: 'Status Saudável',
};

export const FocusCard: React.FC<FocusCardProps> = ({
  priority,
  title,
  description,
  action,
  className,
}) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Card variant="soft" className={cn(
      'shadow-sm',
      config.containerClass,
      className
    )}>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start gap-3">
          <div className={cn(
            'rounded-2xl border border-border/60 bg-background/80 p-2.5 shadow-sm',
            config.iconClass
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={config.badgeClass}>
                {priorityLabels[priority]}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>
          {action && (
            <Button
              variant="outline"
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
