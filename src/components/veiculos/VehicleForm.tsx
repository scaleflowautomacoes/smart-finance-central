import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle } from '@/types/financial';
import { Save, Car } from 'lucide-react';

interface VehicleFormProps {
  vehicle?: Vehicle;
  workspace: 'PF' | 'PJ';
  onSubmit: (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, workspace, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    plate: '',
    current_km: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year.toString(),
        plate: vehicle.plate,
        current_km: vehicle.current_km.toString(),
      });
    }
  }, [vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    const vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'created_at'> = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: parseInt(formData.year),
      plate: formData.plate.trim(),
      current_km: parseInt(formData.current_km),
      workspace: workspace,
    };

    await onSubmit(vehicleData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5" />
          <span>{vehicle ? 'Editar Veículo' : 'Novo Veículo'} - {workspace}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Apelido/Nome</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" value={formData.brand} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" value={formData.model} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input id="year" type="number" min="1900" max="2100" value={formData.year} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" value={formData.plate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_km">KM Atual</Label>
              <Input id="current_km" type="number" min="0" value={formData.current_km} onChange={handleChange} required />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Veículo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VehicleForm;