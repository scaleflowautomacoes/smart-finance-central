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
    containerClass: 'border-rose-500/15 bg-gradient-to-br from-rose-500/8 via-rose-500/4 to-transparent',
    badgeClass: 'border-rose-500/15 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    icon: AlertCircle,
    iconClass: 'text-rose-500',
  },
  medium: {
    containerClass: 'border-amber-500/15 bg-gradient-to-br from-amber-500/8 via-amber-500/4 to-transparent',
    badgeClass: 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    icon: Clock,
    iconClass: 'text-amber-500',
  },
  low: {
    containerClass: 'border-emerald-500/15 bg-gradient-to-br from-emerald-500/8 via-emerald-500/4 to-transparent',
    badgeClass: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: TrendingUp,
    iconClass: 'text-emerald-500',
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
      'shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]',
      config.containerClass,
      className
    )}>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start gap-3">
          <div className={cn(
            'rounded-2xl border border-border/60 bg-background/80 p-2 shadow-sm',
            config.iconClass
          )}>
            <Icon className="h-4.5 w-4.5" />
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
            <p className="text-sm leading-6 text-muted-foreground mt-1">
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
