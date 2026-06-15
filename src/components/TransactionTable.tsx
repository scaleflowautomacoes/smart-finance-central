import React, { useState, useMemo, useEffect } from 'react';
import { Edit2, Trash2, Calendar, DollarSign, MoreVertical, Copy, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Transaction, Category } from '@/types/financial';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRangeState } from './DateRangeFilter';
import TransactionFilters from './TransactionFilters';
import RecurrenceIndicator from './RecurrenceIndicator';
import { formatFinancialDate, isFinancialDateWithinRange, parseFinancialDate } from '@/utils/financialDate';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  workspace: 'PF' | 'PJ';
  dateRange: DateRangeState;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onBulkUpdate: (ids: string[], updates: Partial<Transaction>) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkCancelRecurrence: (parentIds: string[]) => Promise<void>;
  actionLoading?: boolean;
  loading?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  workspace,
  dateRange,
  onEdit,
  onDelete,
  onBulkUpdate,
  onBulkDelete,
  onBulkCancelRecurrence,
  actionLoading = false,
  loading = false
}) => {
  const isMobile = useIsMobile();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRecurrence, setFilterRecurrence] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkPayment, setBulkPayment] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkDate, setBulkDate] = useState<string>('');
  
  const debouncedFilterStatus = useDebounce(filterStatus, 300);
  const debouncedFilterType = useDebounce(filterType, 300);
  const debouncedFilterCategory = useDebounce(filterCategory, 300);
  const debouncedFilterRecurrence = useDebounce(filterRecurrence, 300);
  const debouncedFilterPayment = useDebounce(filterPayment, 300);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.deletado || t.origem !== workspace) return false;
      if (debouncedFilterStatus !== 'all' && t.status !== debouncedFilterStatus) return false;
      if (debouncedFilterType !== 'all' && t.tipo !== debouncedFilterType) return false;
      if (debouncedFilterCategory !== 'all' && t.categoria_id !== debouncedFilterCategory) return false;
      // if (debouncedFilterDependency !== 'all' && t.dependencia !== debouncedFilterDependency) return false; // REMOVIDO
      if (debouncedFilterRecurrence !== 'all' && t.recorrencia !== debouncedFilterRecurrence) return false;
      if (debouncedFilterPayment !== 'all' && t.forma_pagamento !== debouncedFilterPayment) return false;
      if (debouncedSearchTerm && !t.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) return false;
      
      return isFinancialDateWithinRange(t.data, dateRange.startDate, dateRange.endDate);
    });
  }, [transactions, workspace, debouncedFilterStatus, debouncedFilterType, debouncedFilterCategory, debouncedFilterRecurrence, debouncedFilterPayment, debouncedSearchTerm, dateRange]);

  const formatCurrency = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, []);

  const formatDate = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR');
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [workspace, dateRange, debouncedFilterStatus, debouncedFilterType, debouncedFilterCategory, debouncedFilterRecurrence, debouncedFilterPayment, debouncedSearchTerm]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'prevista': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'realizada': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'vencida': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'cancelada': 'bg-muted text-muted-foreground'
    };
    
    return (
      <Badge className={variants[status] || 'bg-muted text-muted-foreground'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (tipo: string) => {
    return (
      <Badge variant={tipo === 'entrada' ? 'default' : 'secondary'}>
        {tipo === 'entrada' ? 'Entrada' : 'Saída'}
      </Badge>
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      onDelete(id);
    }
  };

  const handleDuplicate = (transaction: Transaction) => {
    const duplicatedTransaction = {
      ...transaction,
      nome: `${transaction.nome} (Cópia)`,
      data: formatFinancialDate(new Date())
    };
    onEdit(duplicatedTransaction);
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }

    const newSelection = new Set(filteredTransactions.map((transaction) => transaction.id));
    setSelectedIds(newSelection);
  };

  const toggleSelectOne = (transactionId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(transactionId);
      } else {
        next.delete(transactionId);
      }
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const allVisibleSelected = filteredTransactions.length > 0 && filteredTransactions.every((transaction) => selectedIds.has(transaction.id));

  const clearBulkSelection = () => {
    setSelectedIds(new Set());
    setBulkStatus('');
    setBulkPayment('');
    setBulkCategory('');
    setBulkDate('');
  };

  const applyBulkUpdate = async (updates: Partial<Transaction>) => {
    if (selectedCount === 0) return;
    await onBulkUpdate(Array.from(selectedIds), updates);
    clearBulkSelection();
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedCount} transações?`)) return;
    await onBulkDelete(Array.from(selectedIds));
    clearBulkSelection();
  };

  const handleBulkCancelRecurrence = async () => {
    const parentIds = Array.from(
      new Set(
        filteredTransactions
          .filter((transaction) => selectedIds.has(transaction.id))
          .map((transaction) => transaction.is_recorrente ? transaction.id : transaction.recorrencia_transacao_pai_id)
          .filter(Boolean) as string[]
      )
    );

    if (parentIds.length === 0) {
      alert('Nenhuma recorrência encontrada nas transações selecionadas.');
      return;
    }

    await onBulkCancelRecurrence(parentIds);
    clearBulkSelection();
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterCategory('all');
    setFilterRecurrence('all');
    setFilterPayment('all');
    setSearchTerm('');
  };

  const uniqueCategories = useMemo(() => {
    return categories
      .filter((category) => category.origem === workspace)
      .map((category) => ({ id: category.id, nome: category.nome }));
  }, [categories, workspace]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Carregando transações...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Transações - {workspace === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </CardTitle>
        </div>
        
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onTypeChange={setFilterType}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          filterRecurrence={filterRecurrence}
          onRecurrenceChange={setFilterRecurrence}
          filterPayment={filterPayment}
          onPaymentChange={setFilterPayment}
          uniqueCategories={uniqueCategories}
          workspace={workspace}
          onClearFilters={clearFilters}
        />
      </CardHeader>
      
      <CardContent>
        {selectedCount > 0 && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-primary">{selectedCount} selecionada(s)</span>
              <Button
                size="sm"
                variant="outline"
                onClick={clearBulkSelection}
                disabled={actionLoading}
              >
                Limpar seleção
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={actionLoading}
              >
                Excluir em massa
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkCancelRecurrence}
                disabled={actionLoading}
              >
                <Ban className="h-4 w-4 mr-2" />
                Retirar recorrência
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              <div className="flex gap-2">
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prevista">Prevista</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => applyBulkUpdate({ status: bulkStatus as Transaction['status'] })}
                  disabled={!bulkStatus || actionLoading}
                >
                  Aplicar
                </Button>
              </div>

              <div className="flex gap-2">
                <Select value={bulkPayment} onValueChange={setBulkPayment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Forma pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => applyBulkUpdate({ forma_pagamento: bulkPayment as Transaction['forma_pagamento'] })}
                  disabled={!bulkPayment || actionLoading}
                >
                  Aplicar
                </Button>
              </div>

              <div className="flex gap-2">
                <Select value={bulkCategory} onValueChange={setBulkCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => applyBulkUpdate({ categoria_id: bulkCategory })}
                  disabled={!bulkCategory || actionLoading}
                >
                  Aplicar
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  type="date"
                  value={bulkDate}
                  onChange={(event) => setBulkDate(event.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => applyBulkUpdate({ data: bulkDate })}
                  disabled={!bulkDate || actionLoading}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação encontrada para os filtros selecionados.</p>
          </div>
        ) : isMobile ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(transaction.id)}
                        onChange={(event) => toggleSelectOne(transaction.id, event.target.checked)}
                      />
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{transaction.nome}</span>
                        <RecurrenceIndicator transaction={transaction} />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(transaction)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(transaction.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {transaction.observacoes && (
                    <p className="text-sm text-muted-foreground mb-2">{transaction.observacoes}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>{' '}
                      {getTypeBadge(transaction.tipo)}
                    </div>
                    <div className="text-right">
                      <span className={`font-medium ${
                        transaction.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency.format(transaction.valor)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data:</span>{' '}
                      <span className="flex items-center space-x-1 inline-flex">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate.format(parseFinancialDate(transaction.data))}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pagamento:</span>{' '}
                      <span className="capitalize">{transaction.forma_pagamento}</span>
                    </div>
                    {transaction.recorrencia && (
                      <div>
                        <span className="text-muted-foreground">Recorrência:</span>{' '}
                        <span>{transaction.recorrencia}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-center py-3 px-2 font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(event) => toggleSelectAllVisible(event.target.checked)}
                    />
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Nome</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Tipo</th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">Valor</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Data</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Pagamento</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Recorrência</th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(transaction.id)}
                        onChange={(event) => toggleSelectOne(transaction.id, event.target.checked)}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <span>{transaction.nome}</span>
                          <RecurrenceIndicator transaction={transaction} />
                        </div>
                        {transaction.observacoes && (
                          <div className="text-sm text-muted-foreground">{transaction.observacoes}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getTypeBadge(transaction.tipo)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`font-medium ${
                        transaction.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency.format(transaction.valor)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate.format(parseFinancialDate(transaction.data))}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-muted-foreground capitalize">
                        {transaction.forma_pagamento}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {transaction.recorrencia && (
                        <span className="text-sm text-muted-foreground">
                          {transaction.recorrencia}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(transaction)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(transaction)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(transaction.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredTransactions.length} de {transactions.filter(t => !t.deletado && t.origem === workspace).length} transações
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(TransactionTable);
