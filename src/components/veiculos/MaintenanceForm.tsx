import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Maintenance, Vehicle } from '@/types/financial';
import { Save, Wrench } from 'lucide-react';

interface MaintenanceFormProps {
  maintenance?: Maintenance;
  vehicles: Vehicle[];
  onSubmit: (maintenanceData: Omit<Maintenance, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  initialVehicleId?: string;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ maintenance, vehicles, onSubmit, onCancel, loading, initialVehicleId }) => {
  const [formData, setFormData] = useState({
    vehicle_id: initialVehicleId || '',
    type: 'general' as Maintenance['type'],
    description: '',
    cost: '',
    km_performed: '',
    next_km: '',
    date_performed: new Date().toISOString().split('T')[0],
    next_date: '',
  });

  useEffect(() => {
    if (maintenance) {
      setFormData({
        vehicle_id: maintenance.vehicle_id,
        type: maintenance.type,
        description: maintenance.description,
        cost: maintenance.cost.toString(),
        km_performed: maintenance.km_performed.toString(),
        next_km: maintenance.next_km?.toString() || '',
        date_performed: maintenance.date_performed,
        next_date: maintenance.next_date || '',
      });
    }
  }, [maintenance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    const maintenanceData: Omit<Maintenance, 'id' | 'user_id' | 'created_at'> = {
      vehicle_id: formData.vehicle_id,
      type: formData.type,
      description: formData.description.trim(),
      cost: parseFloat(formData.cost),
      km_performed: parseInt(formData.km_performed),
      next_km: formData.next_km ? parseInt(formData.next_km) : undefined,
      date_performed: formData.date_performed,
      next_date: formData.next_date || undefined,
    };

    await onSubmit(maintenanceData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="h-5 w-5" />
          <span>{maintenance ? 'Editar Manutenção' : 'Nova Manutenção'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vehicle_id">Veículo</Label>
              <Select value={formData.vehicle_id} onValueChange={(value) => handleSelectChange('vehicle_id', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Serviço</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil_change">Troca de Óleo</SelectItem>
                  <SelectItem value="tire">Pneus</SelectItem>
                  <SelectItem value="brake">Freios</SelectItem>
                  <SelectItem value="general">Revisão Geral</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input id="cost" type="number" step="0.01" value={formData.cost} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_performed">Data da Manutenção</Label>
              <Input id="date_performed" type="date" value={formData.date_performed} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="km_performed">KM no Serviço</Label>
              <Input id="km_performed" type="number" min="0" value={formData.km_performed} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_km">Próximo KM (Opcional)</Label>
              <Input id="next_km" type="number" min="0" value={formData.next_km} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_date">Próxima Data (Opcional)</Label>
              <Input id="next_date" type="date" value={formData.next_date} onChange={handleChange} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={handleChange} rows={2} />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {maintenance ? 'Salvar Alterações' : 'Registrar Manutenção'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MaintenanceForm;