import { differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns';

const FINANCIAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseFinancialDate = (value: string): Date => {
  const matched = FINANCIAL_DATE_PATTERN.exec(value);
  if (!matched) return new Date(value);

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);

  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const formatFinancialDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayFinancialDate = (): string => formatFinancialDate(new Date());

export const isFinancialDateWithinRange = (
  value: string,
  startDate?: Date,
  endDate?: Date
): boolean => {
  const date = parseFinancialDate(value);
  if (Number.isNaN(date.getTime())) return false;

  if (startDate && date < startOfDay(startDate)) return false;
  if (endDate && date > endOfDay(endDate)) return false;

  return true;
};

export const compareFinancialDateStrings = (a: string, b: string): number => {
  return parseFinancialDate(a).getTime() - parseFinancialDate(b).getTime();
};

export const daysUntilFinancialDate = (value: string, from = new Date()): number => {
  const target = startOfDay(parseFinancialDate(value));
  const base = startOfDay(from);
  return differenceInCalendarDays(target, base);
};
