
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info, Calendar, DollarSign } from 'lucide-react';
import { useFinancialAlerts } from '@/hooks/useFinancialAlerts';
import { Transaction } from '@/types/financial';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashFlowAlertsProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
}

const CashFlowAlerts: React.FC<CashFlowAlertsProps> = ({ transactions, workspace }) => {
  const { alerts, metrics } = useFinancialAlerts(transactions, workspace);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" => {
    return type === 'critical' ? 'destructive' : 'default';
  };

  const criticalAlertsCount = alerts.filter(a => a.type === 'critical').length;
  const warningAlertsCount = alerts.filter(a => a.type === 'warning').length;

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="py-3 px-4">
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <Info className="h-3 w-3" />
            <span>{workspace} - Situação estável</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${criticalAlertsCount > 0 ? 'border-red-200 bg-red-50/30' : 'border-yellow-200 bg-yellow-50/30'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-3 w-3" />
            <span>Alertas {workspace}</span>
          </div>
          <div className="flex space-x-1">
            {criticalAlertsCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0">
                {criticalAlertsCount}
              </Badge>
            )}
            {warningAlertsCount > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {warningAlertsCount}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {/* Alertas Compactos */}
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <span className="font-medium">{alert.title}:</span>{' '}
              <span className={alert.type === 'critical' ? 'text-red-600' : 
                             alert.type === 'warning' ? 'text-yellow-600' : 'text-gray-600'}>
                {alert.message}
              </span>
            </div>
          </div>
        ))}

        {/* Próximas Datas Críticas */}
        {metrics.criticalDates.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">Próximos vencimentos:</span>
            </div>
            {metrics.criticalDates.slice(0, 2).map((item, index) => (
              <div key={index} className="text-xs text-gray-600 ml-4">
                {format(item.date, 'dd/MM', { locale: ptBR })} - 
                R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowAlerts;
