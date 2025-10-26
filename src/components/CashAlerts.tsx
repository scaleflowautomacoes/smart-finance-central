
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useCashFlowAlerts } from '@/hooks/useCashFlowAlerts';
import { Transaction } from '@/types/financial';

interface CashAlertsProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
}

const CashAlerts: React.FC<CashAlertsProps> = ({ transactions, workspace }) => {
  const alerts = useCashFlowAlerts(transactions, workspace);

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  const getBadgeVariant = (type: string): "default" | "destructive" | "secondary" => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Alertas {workspace}
          </span>
          <Badge variant={getBadgeVariant(alerts[0]?.type)} className="text-xs">
            {alerts.length}
          </Badge>
        </div>
        <div className="space-y-1">
          {alerts.slice(0, 2).map((alert, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              {getIcon(alert.type)}
              <span className="flex-1 truncate">{alert.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CashAlerts;
