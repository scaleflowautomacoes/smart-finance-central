import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Goal, Category } from '@/types/financial';
import { Save, Target } from 'lucide-react';

interface GoalFormProps {
  goal?: Goal;
  workspace: 'PF' | 'PJ';
  categories: Category[];
  onSubmit: (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, workspace, categories, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    deadline: new Date().toISOString().split('T')[0],
    type: 'saving' as Goal['type'],
    category_id: '',
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description,
        target_amount: goal.target_amount.toString(),
        deadline: goal.deadline,
        type: goal.type,
        category_id: goal.category_id || '',
      });
    }
  }, [goal]);

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

    const goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'current_amount' | 'status'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline,
      type: formData.type,
      category_id: formData.category_id || undefined,
      workspace: workspace,
    };

    await onSubmit(goalData);
  };
  
  const filteredCategories = categories.filter(c => c.origem === workspace && c.tipo === 'entrada');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>{goal ? 'Editar Meta' : 'Nova Meta'} - {workspace}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Meta</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saving">Poupança/Reserva</SelectItem>
                  <SelectItem value="revenue">Aumento de Receita</SelectItem>
                  <SelectItem value="expense_reduction">Redução de Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_amount">Valor Objetivo (R$)</Label>
              <Input id="target_amount" type="number" step="0.01" value={formData.target_amount} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo Final</Label>
              <Input id="deadline" type="date" value={formData.deadline} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={handleChange} rows={2} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="category_id">Vincular Categoria (Opcional)</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Vincular a uma categoria de entrada/saída" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma Categoria</SelectItem>
                  {filteredCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome} ({cat.tipo})
                    </SelectItem>
                  ))}
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
              {loading ? 'Salvando...' : 'Salvar Meta'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoalForm;