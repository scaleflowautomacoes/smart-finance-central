
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import DependencyFilter from './DependencyFilter';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterDependency: string;
  onDependencyChange: (value: string) => void;
  filterRecurrence: string;
  onRecurrenceChange: (value: string) => void;
  filterPayment: string;
  onPaymentChange: (value: string) => void;
  uniqueCategories: string[];
  workspace: 'PF' | 'PJ';
  onClearFilters: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
  filterCategory,
  onCategoryChange,
  filterDependency,
  onDependencyChange,
  filterRecurrence,
  onRecurrenceChange,
  filterPayment,
  onPaymentChange,
  uniqueCategories,
  workspace,
  onClearFilters
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Nome da transação..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os Tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="saida">Saídas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="prevista">Prevista</SelectItem>
            <SelectItem value="realizada">Realizada</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={filterCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as Categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {uniqueCategories.map((categoryId) => (
              <SelectItem key={categoryId} value={categoryId || ''}>
                {categoryId || 'Sem categoria'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DependencyFilter
        selectedDependency={filterDependency}
        onDependencyChange={onDependencyChange}
        workspace={workspace}
      />
      
      <div className="space-y-2">
        <Label>Recorrência</Label>
        <Select value={filterRecurrence} onValueChange={onRecurrenceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as Recorrências" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Recorrências</SelectItem>
            <SelectItem value="Setup">Setup</SelectItem>
            <SelectItem value="Fee Mensal">Fee Mensal</SelectItem>
            <SelectItem value="Avulso">Avulso</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Pagamento</Label>
        <Select value={filterPayment} onValueChange={onPaymentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as Formas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Formas</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>&nbsp;</Label>
        <Button variant="outline" onClick={onClearFilters} className="w-full">
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
