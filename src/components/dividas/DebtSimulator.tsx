import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingDown, AlertTriangle } from 'lucide-react';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface AmortizationEntry {
  month: number;
  initialBalance: number;
  payment: number;
  interest: number;
  principal: number;
  finalBalance: number;
}

const DebtSimulator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(12); // % anual
  const [installments, setInstallments] = useState(24);
  const [extraPayment, setExtraPayment] = useState(0);

  const monthlyRate = useMemo(() => interestRate / 100 / 12, [interestRate]);

  const amortizationPlan = useMemo(() => {
    if (initialAmount <= 0 || installments <= 0 || monthlyRate < 0) return [];

    let balance = initialAmount;
    const plan: AmortizationEntry[] = [];
    let month = 1;
    
    // Cálculo da parcela fixa (Tabela Price)
    const paymentFixed = initialAmount * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -installments)));
    
    // Se a taxa de juros for zero, a parcela é simplesmente o valor inicial dividido pelo número de parcelas
    const monthlyPayment = monthlyRate === 0 ? initialAmount / installments : paymentFixed;

    while (balance > 0 && month <= 1200) { // Limite de 100 anos para evitar loops infinitos
      const initialBalance = balance;
      const interest = initialBalance * monthlyRate;
      
      // Pagamento total (parcela fixa + extra)
      const totalPayment = monthlyPayment + extraPayment;
      
      // O principal é o pagamento total menos os juros, limitado ao saldo inicial
      let principal = Math.min(initialBalance, totalPayment - interest);
      
      // Se o pagamento total for menor que os juros, a dívida está crescendo (não deve acontecer com Price)
      if (totalPayment < interest) {
          principal = 0; // A dívida está crescendo
      }
      
      const finalBalance = initialBalance - principal;
      
      plan.push({
        month,
        initialBalance,
        payment: totalPayment,
        interest,
        principal,
        finalBalance: Math.max(0, finalBalance),
      });

      balance = Math.max(0, finalBalance);
      month++;
      
      // Se o saldo final for zero, paramos
      if (balance === 0) break;
    }

    return plan;
  }, [initialAmount, monthlyRate, installments, extraPayment]);
  
  const totalInterestPaid = amortizationPlan.reduce((sum, entry) => sum + entry.interest, 0);
  const totalMonths = amortizationPlan.length;
  const totalPaid = initialAmount + totalInterestPaid;

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2 text-purple-700">
          <Calculator className="h-6 w-6" />
          <span>Simulador de Quitação de Dívidas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialAmount">Valor Inicial (R$)</Label>
            <Input 
              id="initialAmount" 
              type="number" 
              step="100" 
              value={initialAmount} 
              onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Juros (% anual)</Label>
            <Input 
              id="interestRate" 
              type="number" 
              step="0.1" 
              value={interestRate} 
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installments">Parcelas Originais (meses)</Label>
            <Input 
              id="installments" 
              type="number" 
              min="1" 
              value={installments} 
              onChange={(e) => setInstallments(parseInt(e.target.value) || 0)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extraPayment">Pagamento Extra Mensal (R$)</Label>
            <Input 
              id="extraPayment" 
              type="number" 
              step="10" 
              value={extraPayment} 
              onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)} 
            />
          </div>
        </div>

        {/* Resultados do Simulado */}
        {initialAmount > 0 && installments > 0 && amortizationPlan.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <span>Resultado da Simulação</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Parcela Mensal (Base)</p>
                <p className="font-bold text-lg text-blue-700">
                  {formatCurrency(amortizationPlan[0]?.payment || 0)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Total Pago</p>
                <p className="font-bold text-lg">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Juros Totais</p>
                <p className="font-bold text-lg text-red-700">
                  {formatCurrency(totalInterestPaid)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <p className="text-muted-foreground">Meses para Quitar</p>
                <p className="font-bold text-lg text-purple-700">
                  {totalMonths} {totalMonths > 1 ? 'meses' : 'mês'}
                </p>
              </div>
            </div>
            
            {totalMonths > installments && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Atenção: O plano de amortização excedeu o limite de parcelas. Verifique a taxa de juros ou o pagamento extra.</span>
                </div>
            )}

            {/* Tabela de Amortização (Opcional) */}
            <h4 className="text-md font-semibold pt-4">Plano de Amortização (Primeiros 10 meses)</h4>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-card">
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Saldo Inicial</TableHead>
                    <TableHead className="text-right">Pagamento Total</TableHead>
                    <TableHead className="text-right text-red-600">Juros</TableHead>
                    <TableHead className="text-right text-green-600">Principal</TableHead>
                    <TableHead className="text-right">Saldo Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amortizationPlan.slice(0, 10).map((entry) => (
                    <TableRow key={entry.month}>
                      <TableCell>{entry.month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.initialBalance)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(entry.payment)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(entry.interest)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(entry.principal)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(entry.finalBalance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtSimulator;