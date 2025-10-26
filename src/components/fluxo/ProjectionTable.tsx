import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyProjection } from '@/hooks/useCashFlowProjection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase } from 'lucide-react';

interface ProjectionTableProps {
  projection: MonthlyProjection[];
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ProjectionTable: React.FC<ProjectionTableProps> = ({ projection }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Tabela de Projeção Mensal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Mês/Período</TableHead>
              <TableHead className="text-right">Receitas Previstas</TableHead>
              <TableHead className="text-right">Despesas Previstas</TableHead>
              <TableHead className="text-right">Saldo do Mês</TableHead>
              <TableHead className="text-right">Saldo Acumulado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projection.map((item, index) => (
              <TableRow key={index} className={item.saldoAcumulado < 0 ? 'bg-red-50 hover:bg-red-100' : ''}>
                <TableCell className="font-medium">{item.monthLabel}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  {formatCurrency(item.receitasPrevistas)}
                </TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {formatCurrency(item.despesasPrevistas)}
                </TableCell>
                <TableCell className={`text-right font-bold ${item.saldoMes >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(item.saldoMes)}
                </TableCell>
                <TableCell className={`text-right font-bold ${item.saldoAcumulado >= 0 ? 'text-primary' : 'text-red-800'}`}>
                  {formatCurrency(item.saldoAcumulado)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectionTable;