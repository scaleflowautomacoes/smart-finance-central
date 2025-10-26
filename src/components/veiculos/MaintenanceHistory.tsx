import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Maintenance, Vehicle } from '@/types/financial';
import { Wrench, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MaintenanceHistoryProps {
  vehicle: Vehicle;
  maintenances: Maintenance[];
  onDeleteMaintenance: (id: string) => void;
  loading: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ 
  vehicle, 
  maintenances, 
  onDeleteMaintenance, 
  loading 
}) => {
  const vehicleMaintenances = maintenances
    .filter(m => m.vehicle_id === vehicle.id)
    .sort((a, b) => new Date(b.date_performed).getTime() - new Date(a.date_performed).getTime());

  const getMaintenanceTypeLabel = (type: Maintenance['type']) => {
    switch (type) {
      case 'oil_change': return 'Troca de Óleo';
      case 'tire': return 'Pneus';
      case 'brake': return 'Freios';
      case 'general': return 'Revisão Geral';
      case 'other': return 'Outro';
      default: return 'Serviço';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Wrench className="h-5 w-5" />
          <span>Histórico de Manutenções - {vehicle.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto p-4">
        {vehicleMaintenances.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Nenhuma manutenção registrada para este veículo.
          </div>
        ) : (
          <div className="space-y-4">
            {vehicleMaintenances.map((m) => (
              <div key={m.id} className="border p-4 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="secondary">{getMaintenanceTypeLabel(m.type)}</Badge>
                    <p className="font-medium text-base">{m.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(m.date_performed), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <span>|</span>
                      <span>{m.km_performed.toLocaleString('pt-BR')} km</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="font-bold text-lg text-red-600 dark:text-red-400">
                      {formatCurrency(m.cost)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDeleteMaintenance(m.id)} 
                      disabled={loading}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {(m.next_km || m.next_date) && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 text-xs text-muted-foreground">
                    Próxima Manutenção: 
                    {m.next_km && ` KM ${m.next_km.toLocaleString('pt-BR')}`}
                    {m.next_km && m.next_date && ' ou '}
                    {m.next_date && ` Data ${format(new Date(m.next_date), 'dd/MM/yyyy')}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceHistory;