import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Calendar, DollarSign, MoreVertical, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/financial';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/hooks/useDebounce';
import { PeriodType } from './PeriodFilter';
import PeriodFilter from './PeriodFilter';
import TransactionFilters from './TransactionFilters';
import RecurrenceIndicator from './RecurrenceIndicator';

interface TransactionTableProps {
  transactions: Transaction[];
  workspace: 'PF' | 'PJ';
  periodFilter: {
    type: PeriodType;
    startDate?: Date;
    endDate?: Date;
  };
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  workspace,
  periodFilter,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDependency, setFilterDependency] = useState<string>('all');
  const [filterRecurrence, setFilterRecurrence] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const debouncedFilterStatus = useDebounce(filterStatus, 300);
  const debouncedFilterType = useDebounce(filterType, 300);
  const debouncedFilterCategory = useDebounce(filterCategory, 300);
  const debouncedFilterDependency = useDebounce(filterDependency, 300);
  const debouncedFilterRecurrence = useDebounce(filterRecurrence, 300);
  const debouncedFilterPayment = useDebounce(filterPayment, 300);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.deletado || t.origem !== workspace) return false;
      if (debouncedFilterStatus !== 'all' && t.status !== debouncedFilterStatus) return false;
      if (debouncedFilterType !== 'all' && t.tipo !== debouncedFilterType) return false;
      if (debouncedFilterCategory !== 'all' && t.categoria_id !== debouncedFilterCategory) return false;
      if (debouncedFilterDependency !== 'all' && t.dependencia !== debouncedFilterDependency) return false;
      if (debouncedFilterRecurrence !== 'all' && t.recorrencia !== debouncedFilterRecurrence) return false;
      if (debouncedFilterPayment !== 'all' && t.forma_pagamento !== debouncedFilterPayment) return false;
      if (debouncedSearchTerm && !t.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) return false;
      
      // Filter by period
      if (periodFilter.startDate && periodFilter.endDate) {
        const transactionDate = new Date(t.data);
        if (transactionDate < periodFilter.startDate || transactionDate > periodFilter.endDate) return false;
      }
      
      return true;
    });
  }, [transactions, workspace, debouncedFilterStatus, debouncedFilterType, debouncedFilterCategory, debouncedFilterDependency, debouncedFilterRecurrence, debouncedFilterPayment, debouncedSearchTerm, periodFilter]);

  const formatCurrency = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, []);

  const formatDate = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR');
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      'prevista': 'bg-yellow-100 text-yellow-800',
      'realizada': 'bg-green-100 text-green-800',
      'vencida': 'bg-red-100 text-red-800',
      'cancelada': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
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
      data: new Date().toISOString().split('T')[0]
    };
    onEdit(duplicatedTransaction);
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterCategory('all');
    setFilterDependency('all');
    setFilterRecurrence('all');
    setFilterPayment('all');
    setSearchTerm('');
  };

  const uniqueCategories = useMemo(() => {
    const categorySet = new Set(transactions
      .filter(t => t.categoria_id && t.origem === workspace)
      .map(t => t.categoria_id));
    return Array.from(categorySet);
  }, [transactions, workspace]);

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
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
          
          <div className="flex items-center space-x-4">
            <PeriodFilter
              selectedPeriod={periodFilter.type}
              customStartDate={periodFilter.startDate}
              customEndDate={periodFilter.endDate}
              onPeriodChange={() => {}}
            />
          </div>
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
          filterDependency={filterDependency}
          onDependencyChange={setFilterDependency}
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
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação encontrada para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Nome</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Tipo</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Valor</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Data</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Pagamento</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Recorrência</th>
                  {workspace === 'PJ' && (
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Dependência</th>
                  )}
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{transaction.nome}</span>
                          <RecurrenceIndicator transaction={transaction} />
                        </div>
                        {transaction.observacoes && (
                          <div className="text-sm text-gray-500">{transaction.observacoes}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getTypeBadge(transaction.tipo)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`font-medium ${
                        transaction.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency.format(transaction.valor)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{formatDate.format(new Date(transaction.data))}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-gray-600 capitalize">
                        {transaction.forma_pagamento}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {transaction.recorrencia && (
                        <span className="text-sm text-gray-600">
                          {transaction.recorrencia}
                        </span>
                      )}
                    </td>
                    {workspace === 'PJ' && (
                      <td className="py-3 px-2">
                        {transaction.dependencia && (
                          <Badge variant="outline" className="text-xs">
                            {transaction.dependencia}
                          </Badge>
                        )}
                      </td>
                    )}
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
                            className="text-red-600"
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
        
        <div className="mt-4 text-sm text-gray-500">
          Mostrando {filteredTransactions.length} de {transactions.filter(t => !t.deletado && t.origem === workspace).length} transações
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(TransactionTable);
