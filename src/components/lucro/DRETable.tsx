import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase } from 'lucide-react';
import { DREMetrics } from '@/hooks/useProfitLoss';

interface DRETableProps {
  metrics: DREMetrics;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const DRETable: React.FC<DRETableProps> = ({ metrics }) => {
  const getRowClass = (value: number, isResult: boolean = false) => {
    if (isResult) {
      return value >= 0 ? 'font-bold text-lg text-green-700' : 'font-bold text-lg text-red-700';
    }
    return value >= 0 ? 'text-gray-800' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Demonstrativo de Resultado (DRE)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableBody>
            {/* Receita Bruta */}
            <TableRow className="bg-gray-50">
              <TableCell className="font-bold text-base">RECEITA BRUTA</TableCell>
              <TableCell className="text-right font-bold text-base text-green-700">
                {formatCurrency(metrics.receitaBruta)}
              </TableCell>
            </TableRow>
            
            {/* Deduções e Impostos */}
            <TableRow>
              <TableCell className="pl-6 text-sm text-muted-foreground">(-) Deduções e Impostos</TableCell>
              <TableCell className="text-right text-red-600">
                {formatCurrency(metrics.deducoesImpostos)}
              </TableCell>
            </TableRow>
            
            {/* Receita Líquida */}
            <TableRow className="border-y-2 border-gray-200">
              <TableCell className="font-bold">RECEITA LÍQUIDA</TableCell>
              <TableCell className="text-right font-bold text-blue-700">
                {formatCurrency(metrics.receitaLiquida)}
              </TableCell>
            </TableRow>
            
            {/* Custos Variáveis */}
            <TableRow>
              <TableCell className="pl-6 text-sm text-muted-foreground">(-) Custos Variáveis</TableCell>
              <TableCell className="text-right text-red-600">
                {formatCurrency(metrics.custosVariaveis)}
              </TableCell>
            </TableRow>
            
            {/* Margem de Contribuição */}
            <TableRow className="bg-yellow-50/50">
              <TableCell className="font-bold">MARGEM DE CONTRIBUIÇÃO</TableCell>
              <TableCell className={`text-right font-bold ${getRowClass(metrics.margemContribuicao)}`}>
                {formatCurrency(metrics.margemContribuicao)}
              </TableCell>
            </TableRow>
            
            {/* Custos Fixos */}
            <TableRow>
              <TableCell className="pl-6 text-sm text-muted-foreground">(-) Custos Fixos</TableCell>
              <TableCell className="text-right text-red-600">
                {formatCurrency(metrics.custosFixos)}
              </TableCell>
            </TableRow>
            
            {/* EBITDA */}
            <TableRow className="border-y-2 border-gray-200 bg-gray-50">
              <TableCell className="font-bold">EBITDA</TableCell>
              <TableCell className={`text-right font-bold ${getRowClass(metrics.ebitda)}`}>
                {formatCurrency(metrics.ebitda)}
              </TableCell>
            </TableRow>
            
            {/* Despesas/Receitas Financeiras */}
            <TableRow>
              <TableCell className="pl-6 text-sm text-muted-foreground">(-) Despesas Financeiras</TableCell>
              <TableCell className="text-right text-red-600">
                {formatCurrency(metrics.despesasFinanceiras)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-sm text-muted-foreground">(+) Receitas Financeiras</TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency(metrics.receitasFinanceiras)}
              </TableCell>
            </TableRow>
            
            {/* LUCRO LÍQUIDO */}
            <TableRow className="bg-green-50/50 border-t-4 border-green-300">
              <TableCell className="font-extrabold text-xl">LUCRO LÍQUIDO</TableCell>
              <TableCell className={`text-right ${getRowClass(metrics.lucroLiquido, true)}`}>
                {formatCurrency(metrics.lucroLiquido)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DRETable;