import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Debt } from '@/types/financial';
import { Save, Scale } from 'lucide-react';

interface DebtFormProps {
  debt?: Debt;
  workspace: 'PF' | 'PJ';
  onSubmit: (debtData: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'remaining_amount' | 'installments_paid'>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const DebtForm: React.FC<DebtFormProps> = ({ debt, workspace, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    creditor: '',
    total_amount: '',
    interest_rate: '',
    installments_total: '',
    due_date: new Date().toISOString().split('T')[0],
    payment_day: '',
    status: 'active' as 'active' | 'paid' | 'late',
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name,
        creditor: debt.creditor,
        total_amount: debt.total_amount.toString(),
        interest_rate: debt.interest_rate.toString(),
        installments_total: debt.installments_total.toString(),
        due_date: debt.due_date,
        payment_day: debt.payment_day.toString(),
        status: debt.status,
      });
    }
  }, [debt]);

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

    const debtData: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'remaining_amount' | 'installments_paid'> = {
      name: formData.name.trim(),
      creditor: formData.creditor.trim(),
      total_amount: parseFloat(formData.total_amount),
      interest_rate: parseFloat(formData.interest_rate),
      installments_total: parseInt(formData.installments_total),
      due_date: formData.due_date,
      payment_day: parseInt(formData.payment_day),
      status: formData.status,
      workspace: workspace,
    };

    await onSubmit(debtData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scale className="h-5 w-5" />
          <span>{debt ? 'Editar Dívida' : 'Nova Dívida'} - {workspace}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Dívida</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditor">Credor</Label>
              <Input id="creditor" value={formData.creditor} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_amount">Valor Total (R$)</Label>
              <Input id="total_amount" type="number" step="0.01" value={formData.total_amount} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Taxa de Juros (% anual)</Label>
              <Input id="interest_rate" type="number" step="0.01" value={formData.interest_rate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installments_total">Total de Parcelas</Label>
              <Input id="installments_total" type="number" min="1" value={formData.installments_total} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_day">Dia de Vencimento (Dia do mês)</Label>
              <Input id="payment_day" type="number" min="1" max="31" value={formData.payment_day} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Data da Primeira Parcela</Label>
              <Input id="due_date" type="date" value={formData.due_date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paid">Paga</SelectItem>
                  <SelectItem value="late">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Dívida'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DebtForm;