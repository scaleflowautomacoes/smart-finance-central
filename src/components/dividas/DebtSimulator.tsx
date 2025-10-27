import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingDown, Clock } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SimulationResult {
  totalPaid: number;
  monthsSaved: number;
  payoffDate: Date;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const DebtSimulator: React.FC = () => {
  const [initialDebt, setInitialDebt] = useState(10000);
  const [monthlyPayment, setMonthlyPayment] = useState(500);
  const [interestRate, setInterestRate] = useState(12); // % anual
  const [extraPayment, setExtraPayment] = useState(0);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const calculatePayoff = (
    principal: number, 
    monthlyRate: number, 
    payment: number, 
    extra: number
  ): SimulationResult => {
    let balance = principal;
    let totalMonths = 0;
    let totalPaid = 0;
    const effectivePayment = payment + extra;
    const startDate = new Date();

    while (balance > 0 && totalMonths < 1200) { // Limite de 100 anos para evitar loops infinitos
      const interest = balance * monthlyRate;
      const principalPaid = effectivePayment - interest;
      
      if (principalPaid <= 0 && balance > 0) {
        // Pagamento não cobre nem os juros, dívida nunca será paga
        return { totalPaid: Infinity, monthsSaved: Infinity, payoffDate: new Date(9999, 0, 1) };
      }
      
      balance -= principalPaid;
      totalPaid += effectivePayment;
      totalMonths++;
      
      if (balance <= 0) {
        totalPaid += balance; // Ajusta o último pagamento
        balance = 0;
        break;
      }
    }
    
    const payoffDate = addMonths(startDate, totalMonths);
    
    // Calcular cenário base (sem pagamento extra)
    let baseMonths = 0;
    let baseBalance = principal;
    while (baseBalance > 0 && baseMonths < 1200) {
      const interest = baseBalance * monthlyRate;
      const principalPaid = monthlyPayment - interest;
      if (principalPaid <= 0 && baseBalance > 0) {
        baseMonths = totalMonths; // Se o base não paga, usamos o resultado atual
        break;
      }
      baseBalance -= principalPaid;
      baseMonths++;
    }
    
    const monthsSaved = baseMonths === Infinity ? 0 : Math.max(0, baseMonths - totalMonths);

    return {
      totalPaid,
      monthsSaved,
      payoffDate,
    };
  };

  const handleSimulate = () => {
    const principal = initialDebt;
    const monthlyRate = (interestRate / 100) / 12;
    const payment = monthlyPayment;
    const extra = extraPayment;

    if (principal <= 0 || monthlyPayment <= 0) {
      setSimulationResult(null);
      return;
    }
    
    const result = calculatePayoff(principal, monthlyRate, payment, extra);
    setSimulationResult(result);
  };

  return (
    <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2 text-purple-700">
          <Calculator className="h-5 w-5" />
          <span>Simulador de Quitação de Dívidas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialDebt">Valor Principal (R$)</Label>
            <Input 
              id="initialDebt" 
              type="number" 
              step="100" 
              value={initialDebt} 
              onChange={(e) => setInitialDebt(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Pagamento Mensal (R$)</Label>
            <Input 
              id="monthlyPayment" 
              type="number" 
              step="10" 
              value={monthlyPayment} 
              onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Juros Anual (%)</Label>
            <Input 
              id="interestRate" 
              type="number" 
              step="0.1" 
              value={interestRate} 
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extraPayment">Pagamento Extra (R$)</Label>
            <Input 
              id="extraPayment" 
              type="number" 
              step="10" 
              value={extraPayment} 
              onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)} 
            />
          </div>
        </div>
        
        <Button onClick={handleSimulate} className="w-full md:w-auto">
          <Calculator className="h-4 w-4 mr-2" />
          Simular Quitação
        </Button>

        {simulationResult && (
          <div className="pt-4 border-t border-purple-200 space-y-3">
            <h3 className="text-base font-semibold text-purple-800">Resultado da Simulação:</h3>
            
            {simulationResult.totalPaid === Infinity ? (
              <div className="text-red-600 font-medium flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Atenção: O pagamento mensal não cobre os juros. A dívida nunca será quitada.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-muted-foreground flex items-center space-x-1 mb-1">
                    <Clock className="h-4 w-4" />
                    <span>Data de Quitação</span>
                  </div>
                  <div className="text-xl font-bold text-purple-700">
                    {format(simulationResult.payoffDate, 'MMMM/yyyy', { locale: ptBR })}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-muted-foreground flex items-center space-x-1 mb-1">
                    <TrendingDown className="h-4 w-4" />
                    <span>Meses Economizados</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    {simulationResult.monthsSaved} meses
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-muted-foreground flex items-center space-x-1 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Total Pago</span>
                  </div>
                  <div className="text-xl font-bold text-gray-700">
                    {formatCurrency(simulationResult.totalPaid)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtSimulator;