import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
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
    containerClass: 'bg-gradient-to-r from-error/5 to-error/10 border-error/20',
    badgeClass: 'bg-error text-error-foreground',
    icon: AlertCircle,
    iconClass: 'text-error',
  },
  medium: {
    containerClass: 'bg-gradient-to-r from-warning/5 to-warning/10 border-warning/20',
    badgeClass: 'bg-warning text-warning-foreground',
    icon: Clock,
    iconClass: 'text-warning',
  },
  low: {
    containerClass: 'bg-gradient-to-r from-success/5 to-success/10 border-success/20',
    badgeClass: 'bg-success text-success-foreground',
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
    <Card className={cn(
      'border shadow-md',
      config.containerClass,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'p-2 rounded-full bg-background',
            config.iconClass
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={config.badgeClass}>
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