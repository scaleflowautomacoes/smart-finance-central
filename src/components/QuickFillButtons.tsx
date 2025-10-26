
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QuickFillData {
  nome: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  categoria?: string;
}

interface QuickFillButtonsProps {
  workspace: 'PF' | 'PJ';
  onQuickFill: (data: QuickFillData) => void;
}

const QuickFillButtons: React.FC<QuickFillButtonsProps> = ({ workspace, onQuickFill }) => {
  const quickFillData = workspace === 'PF' ? [
    { nome: 'Salário', valor: 5000, tipo: 'entrada' as const },
    { nome: 'Freelance', valor: 1500, tipo: 'entrada' as const },
    { nome: 'Supermercado', valor: 300, tipo: 'saida' as const },
    { nome: 'Gasolina', valor: 150, tipo: 'saida' as const },
    { nome: 'Aluguel', valor: 1200, tipo: 'saida' as const },
    { nome: 'Internet', valor: 80, tipo: 'saida' as const },
    { nome: 'Conta de Luz', valor: 120, tipo: 'saida' as const },
    { nome: 'Plano de Saúde', valor: 400, tipo: 'saida' as const },
  ] : [
    { nome: 'Venda de Produto', valor: 2500, tipo: 'entrada' as const },
    { nome: 'Prestação de Serviço', valor: 3000, tipo: 'entrada' as const },
    { nome: 'Consultoria', valor: 1800, tipo: 'entrada' as const },
    { nome: 'Aluguel Escritório', valor: 2000, tipo: 'saida' as const },
    { nome: 'Fornecedores', valor: 1500, tipo: 'saida' as const },
    { nome: 'Marketing', valor: 800, tipo: 'saida' as const },
    { nome: 'Impostos', valor: 600, tipo: 'saida' as const },
    { nome: 'Equipamentos', valor: 1200, tipo: 'saida' as const },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Preenchimento Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickFillData.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onQuickFill(item)}
              className={`text-xs p-2 h-auto flex flex-col items-center space-y-1 ${
                item.tipo === 'entrada' 
                  ? 'border-green-200 hover:bg-green-50' 
                  : 'border-red-200 hover:bg-red-50'
              }`}
            >
              <span className="font-medium">{item.nome}</span>
              <span className={`text-xs ${
                item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
              }`}>
                R$ {item.valor.toLocaleString('pt-BR')}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickFillButtons;
