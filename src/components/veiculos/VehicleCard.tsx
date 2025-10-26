import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Vehicle, Maintenance } from '@/types/financial';
import { Car, Wrench, AlertTriangle, Edit, Trash2, Plus } from 'lucide-react';
import { format, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface VehicleCardProps {
  vehicle: Vehicle;
  maintenances: Maintenance[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onAddMaintenance: (vehicleId: string) => void;
  loading: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, maintenances, onEdit, onDelete, onAddMaintenance, loading }) => {
  const vehicleMaintenances = maintenances.filter(m => m.vehicle_id === vehicle.id);
  
  const nextMaintenanceAlert = React.useMemo(() => {
    let alert: { type: 'km' | 'date', message: string, date?: string, km?: number } | null = null;

    vehicleMaintenances.forEach(m => {
      if (m.next_km && m.next_km <= vehicle.current_km + 1000) {
        const kmRemaining = m.next_km - vehicle.current_km;
        if (!alert || (alert.type === 'km' && kmRemaining < (alert.km! - vehicle.current_km))) {
          alert = {
            type: 'km',
            message: `Próxima manutenção (${m.type}): em ${m.next_km} KM.`,
            km: m.next_km
          };
        }
      }
      
      if (m.next_date && isBefore(parseISO(m.next_date), new Date())) {
        if (!alert || (alert.type === 'date' && isBefore(parseISO(m.next_date), parseISO(alert.date!)))) {
          alert = {
            type: 'date',
            message: `Manutenção de ${m.type} vencida em ${format(parseISO(m.next_date), 'dd/MM/yyyy')}.`,
            date: m.next_date
          };
        }
      }
    });

    return alert;
  }, [vehicle, vehicleMaintenances]);

  return (
    <Card className={`shadow-lg ${nextMaintenanceAlert ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-gray-300'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{vehicle.name}</CardTitle>
          <Badge variant="secondary">{vehicle.workspace}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Alerta de Manutenção */}
        {nextMaintenanceAlert && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{nextMaintenanceAlert.message}</span>
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
              <Car className="h-3 w-3" />
              <span>KM Atual</span>
            </div>
            <div className="text-xl font-bold text-gray-700">
              {vehicle.current_km.toLocaleString('pt-BR')} km
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
              <Wrench className="h-3 w-3" />
              <span>Total Manutenções</span>
            </div>
            <div className="text-xl font-bold text-gray-700">
              {vehicleMaintenances.length}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onAddMaintenance(vehicle.id)} disabled={loading}>
            <Plus className="h-4 w-4 mr-1" />
            Manutenção
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(vehicle)} disabled={loading}>
            <Edit className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o veículo "{vehicle.name}"? Todas as manutenções associadas serão perdidas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(vehicle.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;