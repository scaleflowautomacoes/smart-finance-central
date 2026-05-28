import { Transaction } from '@/types/financial';

export const PROJECTED_STATUSES: Array<Transaction['status']> = ['prevista', 'vencida'];

export const isProjectedStatus = (status: Transaction['status']) => {
  return PROJECTED_STATUSES.includes(status);
};

export const isProjectedTransaction = (transaction: Transaction) => {
  return isProjectedStatus(transaction.status);
};
