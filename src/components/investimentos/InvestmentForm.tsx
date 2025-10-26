import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Investment } from '@/types/financial';
import { Save, DollarSign } from 'lucide-react';

interface InvestmentFormProps {
  investment?: Investment;
  workspace: 'PF' | 'PJ';
  onSubmit: (investmentData: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ investment, workspace, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock' as Investment['type'],
    initial_amount: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expected_return: '',
  });

  useEffect(() => {
    if (investment) {
      setFormData({
        name: investment.name,
        type: investment.type,
        initial_amount: investment.initial_amount.toString(),
        purchase_date: investment.purchase_date,
        expected_return: investment.expected_return.toString(),
      });
    }
  }, [investment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value as Investment['type'] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    const investmentData: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'> = {
      name: formData.name.trim(),
      type: formData.type,
      initial_amount: parseFloat(formData.initial_amount),
      purchase_date: formData.purchase_date,
      expected_return: parseFloat(formData.expected_return),
      workspace: workspace,
    };

    await onSubmit(investmentData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>{investment ? 'Editar Investimento' : 'Novo Investimento'} - {workspace}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Ativo</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Ações</SelectItem>
                  <SelectItem value="fund">Fundos</SelectItem>
                  <SelectItem value="crypto">Criptomoedas</SelectItem>
                  <SelectItem value="real_estate">Imóveis/FII</SelectItem>
                  <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial_amount">Valor Inicial (R$)</Label>
              <Input id="initial_amount" type="number" step="0.01" value={formData.initial_amount} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Data da Compra</Label>
              <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expected_return">Retorno Esperado (% anual)</Label>
              <Input id="expected_return" type="number" step="0.01" value={formData.expected_return} onChange={handleChange} required />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Investimento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvestmentForm;