import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Category } from '@/types/financial';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ListOrdered, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, getRandomCategoryColor } from '@/utils/chartColors';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  categories: Category[];
  workspace: 'PF' | 'PJ';
  startDate: Date;
  endDate: Date;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ 
  transactions, 
  categories, 
  workspace, 
  startDate, 
  endDate 
}) => {
  const data = useMemo(() => {
    const filteredTransactions = transactions.filter(t => {
      if (t.origem !== workspace || t.deletado || t.status !== 'realizada') return false;
      const transactionDate = new Date(t.data);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const categoryMap: { [key: string]: { name: string; entrada: number; saida: number } } = {};

    filteredTransactions.forEach(t => {
      const category = categories.find(c => c.id === t.categoria_id);
      const categoryName = category?.nome || 'Sem Categoria';
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { name: categoryName, entrada: 0, saida: 0 };
      }

      if (t.tipo === 'entrada') {
        categoryMap[categoryName].entrada += t.valor;
      } else {
        categoryMap[categoryName].saida += t.valor;
      }
    });

    const allData = Object.values(categoryMap);

    const topEntradas = allData
      .filter(d => d.entrada > 0)
      .sort((a, b) => b.entrada - a.entrada)
      .slice(0, 5)
      .map((d, index) => ({ ...d, color: getRandomCategoryColor(index) }));

    const topSaidas = allData
      .filter(d => d.saida > 0)
      .sort((a, b) => b.saida - a.saida)
      .slice(0, 5)
      .map((d, index) => ({ ...d, color: getRandomCategoryColor(index + 5) }));

    return { topEntradas, topSaidas };
  }, [transactions, categories, workspace, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-900 ml-2">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Receitas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2 text-green-700">
            <TrendingUp className="h-5 w-5" />
            Top 5 Receitas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 p-6">
          {data.topEntradas.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.topEntradas} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="entrada" name="Receita" fill={getRandomCategoryColor(0)} radius={[4, 4, 0, 0]}>
                  {data.topEntradas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Nenhuma receita realizada no período.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
            <TrendingDown className="h-5 w-5" />
            Top 5 Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 p-6">
          {data.topSaidas.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.topSaidas} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="saida" name="Despesa" fill={getRandomCategoryColor(5)} radius={[4, 4, 0, 0]}>
                  {data.topSaidas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Nenhuma despesa realizada no período.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryBreakdown;