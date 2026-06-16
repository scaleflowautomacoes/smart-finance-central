import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Category } from '@/types/financial';
import { TransactionRow } from './TransactionRow';
import { compareFinancialDateStrings } from '@/utils/financialDate';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildDerivedCategoryMap, dedupeGeneratedRecurrences, resolveEffectiveCategoryId } from '@/lib/financialAnalytics';

interface ImprovedRecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  workspace: 'PF' | 'PJ';
  className?: string;
}

export const ImprovedRecentTransactions: React.FC<ImprovedRecentTransactionsProps> = ({
  transactions,
  categories,
  workspace,
  className,
}) => {
  // Transações que exigem atenção (vencidas, sem categoria, valores altos)
  const criticalTransactions = useMemo(() => {
    const scoped = dedupeGeneratedRecurrences(transactions).filter(
      (transaction) => transaction.origem === workspace && !transaction.deletado,
    );
    const derivedCategories = buildDerivedCategoryMap(scoped);

    return scoped
      .filter(t => t.status === 'vencida' || !resolveEffectiveCategoryId(t, derivedCategories))
      .sort((a, b) => compareFinancialDateStrings(b.data, a.data))
      .slice(0, 3);
  }, [transactions, workspace]);

  // Últimas transações realizadas
  const recentTransactions = useMemo(() => {
    return dedupeGeneratedRecurrences(transactions)
      .filter(t => t.origem === workspace && !t.deletado && t.status === 'realizada')
      .sort((a, b) => compareFinancialDateStrings(b.data, a.data))
      .slice(0, 5);
  }, [transactions, workspace]);

  const getCategoryName = (id?: string) => {
    return categories.find(c => c.id === id)?.nome || 'Geral';
  };

  const hasCritical = criticalTransactions.length > 0;
  const hasRecent = recentTransactions.length > 0;

  if (!hasCritical && !hasRecent) {
    return (
      <Card variant="soft" className={cn('shadow-sm', className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Nenhuma transação encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Transações que exigem atenção */}
      {hasCritical && (
        <Card variant="soft" className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg font-semibold text-foreground">
                Transações que exigem atenção
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {criticalTransactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  categoryName={getCategoryName(t.categoria_id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimas transações realizadas */}
      {hasRecent && (
        <Card variant="soft" className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Últimas Transações
            </CardTitle>
            <Link 
              to="/" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentTransactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  categoryName={getCategoryName(t.categoria_id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
