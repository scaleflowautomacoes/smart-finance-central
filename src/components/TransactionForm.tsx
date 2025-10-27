import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save } from 'lucide-react';
import { Transaction, Category, Client } from '@/types/financial';
import QuickFillButtons from './QuickFillButtons';
import RecurrenceConfig from './RecurrenceConfig';
import RecurrenceManager from './RecurrenceManager';

interface TransactionFormProps {
  transaction?: Transaction;
  workspace: 'PF' | 'PJ';
  categories: Category[];
  clients: Client[];
  onSubmit: (transaction: Omit<Transaction, 'id' | 'deletado'>) => void;
  onCancel: () => void;
  onAddCategory?: (category: Omit<Category, 'id'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  workspace,
  categories,
  clients,
  onSubmit,
  onCancel,
  onAddCategory
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    origem: workspace,
    forma_pagamento: 'pix' as 'pix' | 'boleto' | 'cartao' | 'dinheiro',
    status: 'prevista' as 'prevista' | 'realizada' | 'vencida' | 'cancelada',
    cliente_id: '',
    categoria_id: '',
    subcategoria_id: '',
    // dependencia: '' as '' | 'Infoprodutos' | 'Chips' | 'Automações' | 'Disparos' | 'Co-produção', // REMOVIDO
    recorrencia: '' as '' | 'Setup' | 'Fee Mensal' | 'Avulso',
    observacoes: '',
    // Novos campos de recorrência
    is_recorrente: false,
    recorrencia_tipo: '' as '' | 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual',
    recorrencia_total_ocorrencias: ''
  });

  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        nome: transaction.nome,
        tipo: transaction.tipo,
        valor: transaction.valor.toString(),
        data: transaction.data,
        origem: transaction.origem,
        forma_pagamento: transaction.forma_pagamento,
        status: transaction.status,
        cliente_id: transaction.cliente_id || '',
        categoria_id: transaction.categoria_id || '',
        subcategoria_id: transaction.subcategoria_id || '',
        // dependencia: transaction.dependencia || '', // REMOVIDO
        recorrencia: transaction.recorrencia || '',
        observacoes: transaction.observacoes || '',
        is_recorrente: transaction.is_recorrente || false,
        recorrencia_tipo: transaction.recorrencia_tipo || '',
        recorrencia_total_ocorrencias: transaction.recorrencia_total_ocorrencias?.toString() || ''
      });
    }
  }, [transaction]);

  const filteredCategories = categories.filter(c => c.origem === workspace && c.tipo === formData.tipo);

  const handleQuickFill = (quickData: { nome: string; valor: number; tipo: 'entrada' | 'saida' }) => {
    setFormData(prev => ({
      ...prev,
      nome: quickData.nome,
      valor: quickData.valor.toString(),
      tipo: quickData.tipo
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validação dos campos obrigatórios
    if (!formData.nome.trim()) {
      console.error('❌ Nome da transação é obrigatório');
      return;
    }
    
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      console.error('❌ Valor deve ser maior que zero');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('📝 Dados do formulário antes da conversão:', formData);
      
      const transactionData: Omit<Transaction, 'id' | 'deletado'> = {
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        data: formData.data,
        origem: formData.origem,
        forma_pagamento: formData.forma_pagamento,
        status: formData.status,
        cliente_id: formData.cliente_id || undefined,
        categoria_id: formData.categoria_id || undefined,
        subcategoria_id: formData.subcategoria_id || undefined,
        dependencia: undefined, // Definido como undefined após remoção
        recorrencia: formData.recorrencia || undefined,
        observacoes: formData.observacoes?.trim() || undefined,
        // Campos de recorrência
        is_recorrente: formData.is_recorrente,
        recorrencia_tipo: formData.recorrencia_tipo || undefined,
        recorrencia_total_ocorrencias: formData.recorrencia_total_ocorrencias ? parseInt(formData.recorrencia_total_ocorrencias) : undefined,
        recorrencia_ocorrencia_atual: formData.is_recorrente ? 1 : undefined,
        recorrencia_ativa: formData.is_recorrente || undefined
      };

      console.log('📤 Dados da transação preparados para envio:', transactionData);
      
      await onSubmit(transactionData);
    } catch (error) {
      console.error('❌ Erro ao salvar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName && onAddCategory) {
      await onAddCategory({
        nome: newCategoryName,
        origem: workspace,
        tipo: formData.tipo
      });
      setNewCategoryName('');
      setNewCategoryDialog(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Quick Fill Buttons */}
      <QuickFillButtons workspace={workspace} onQuickFill={handleQuickFill} />
      
      {/* Recurrence Manager for editing existing recurrent transactions */}
      {transaction && transaction.is_recorrente && (
        <RecurrenceManager 
          transaction={transaction} 
          onUpdate={() => window.location.reload()} 
        />
      )}
      
      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'} - {workspace === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Transação</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => updateFormData('nome', e.target.value)}
                  placeholder="Ex: Salário, Supermercado..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Transação</Label>
                <Select value={formData.tipo} onValueChange={(value) => updateFormData('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => updateFormData('valor', e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => updateFormData('data', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                <Select value={formData.forma_pagamento} onValueChange={(value) => updateFormData('forma_pagamento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status da Transação</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prevista">Prevista</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="categoria_id">Categoria</Label>
                  <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Nova
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Categoria</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Nome da categoria"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <Button onClick={handleAddCategory} disabled={!newCategoryName}>
                            Adicionar
                          </Button>
                          <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={formData.categoria_id} onValueChange={(value) => updateFormData('categoria_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente_id">Responsável</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => updateFormData('cliente_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* REMOVIDO: Dependência */}
              {/* {workspace === 'PJ' && (
                <div className="space-y-2">
                  <Label htmlFor="dependencia">Dependência</Label>
                  <Select value={formData.dependencia} onValueChange={(value) => updateFormData('dependencia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dependência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infoprodutos">Infoprodutos</SelectItem>
                      <SelectItem value="Chips">Chips</SelectItem>
                      <SelectItem value="Automações">Automações</SelectItem>
                      <SelectItem value="Disparos">Disparos</SelectItem>
                      <SelectItem value="Co-produção">Co-produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )} */}

              <div className="space-y-2">
                <Label htmlFor="recorrencia">Recorrência</Label>
                <Select value={formData.recorrencia} onValueChange={(value) => updateFormData('recorrencia', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a recorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Setup">Setup</SelectItem>
                    <SelectItem value="Fee Mensal">Fee Mensal</SelectItem>
                    <SelectItem value="Avulso">Avulso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => updateFormData('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre a transação..."
                rows={3}
              />
            </div>

            {/* Configuração de Recorrência - apenas para novas transações ou transações não recorrentes */}
            {(!transaction || !transaction.is_recorrente) && (
              <RecurrenceConfig
                isRecorrente={formData.is_recorrente}
                recorrenciaTipo={formData.recorrencia_tipo}
                totalOcorrencias={formData.recorrencia_total_ocorrencias}
                onRecorrenteChange={(value) => updateFormData('is_recorrente', value)}
                onTipoChange={(value) => updateFormData('recorrencia_tipo', value)}
                onOcorrenciasChange={(value) => updateFormData('recorrencia_total_ocorrencias', value)}
              />
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Salvando...' : 'Salvar Transação'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;