import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type PresetName =
  | 'tudo'
  | '7dias'
  | '15dias'
  | '30dias'
  | 'este-mes'
  | 'mes-passado'
  | '3meses'
  | '6meses'
  | '1ano'
  | 'custom';

export interface DateRangeState {
  startDate?: Date;
  endDate?: Date;
  presetName: PresetName;
}

export interface PeriodPreset {
  name: PresetName;
  label: string;
  getRange: (anchorDate?: Date) => { start?: Date; end?: Date };
}

export interface PeriodComparisonWindow {
  startDate?: Date;
  endDate?: Date;
}

export const PERIOD_PRESETS: PeriodPreset[] = [
  {
    name: 'tudo',
    label: 'Todo o período',
    getRange: () => ({ start: undefined, end: undefined }),
  },
  {
    name: '7dias',
    label: '7 dias',
    getRange: (anchorDate = new Date()) => ({
      start: startOfDay(addDays(anchorDate, -6)),
      end: endOfDay(anchorDate),
    }),
  },
  {
    name: '15dias',
    label: '15 dias',
    getRange: (anchorDate = new Date()) => ({
      start: startOfDay(addDays(anchorDate, -14)),
      end: endOfDay(anchorDate),
    }),
  },
  {
    name: '30dias',
    label: '30 dias',
    getRange: (anchorDate = new Date()) => ({
      start: startOfDay(addDays(anchorDate, -29)),
      end: endOfDay(anchorDate),
    }),
  },
  {
    name: 'este-mes',
    label: 'Este mês',
    getRange: (anchorDate = new Date()) => ({
      start: startOfMonth(anchorDate),
      end: endOfMonth(anchorDate),
    }),
  },
  {
    name: 'mes-passado',
    label: 'Mês passado',
    getRange: (anchorDate = new Date()) => {
      const lastMonth = subMonths(anchorDate, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    },
  },
  {
    name: '3meses',
    label: 'Últimos 3 meses',
    getRange: (anchorDate = new Date()) => ({
      start: startOfMonth(subMonths(anchorDate, 2)),
      end: endOfMonth(anchorDate),
    }),
  },
  {
    name: '6meses',
    label: 'Últimos 6 meses',
    getRange: (anchorDate = new Date()) => ({
      start: startOfMonth(subMonths(anchorDate, 5)),
      end: endOfMonth(anchorDate),
    }),
  },
  {
    name: '1ano',
    label: 'Último ano',
    getRange: (anchorDate = new Date()) => ({
      start: startOfMonth(subMonths(anchorDate, 11)),
      end: endOfMonth(anchorDate),
    }),
  },
  {
    name: 'custom',
    label: 'Personalizado',
    getRange: (anchorDate = new Date()) => ({
      start: startOfMonth(anchorDate),
      end: endOfMonth(anchorDate),
    }),
  },
];

export const getPeriodPreset = (presetName: PresetName) =>
  PERIOD_PRESETS.find((preset) => preset.name === presetName) ?? PERIOD_PRESETS[0];

export const getDateRangeFromPreset = (presetName: PresetName, anchorDate = new Date()) => {
  return getPeriodPreset(presetName).getRange(anchorDate);
};

export const createCurrentMonthDateRangeState = (anchorDate = new Date()): DateRangeState => {
  const { start, end } = getDateRangeFromPreset('este-mes', anchorDate);
  return {
    startDate: start,
    endDate: end,
    presetName: 'este-mes',
  };
};

export const createAllPeriodDateRangeState = (): DateRangeState => ({
  startDate: undefined,
  endDate: undefined,
  presetName: 'tudo',
});

export const getPreviousWindowRange = (startDate?: Date, endDate?: Date): PeriodComparisonWindow | null => {
  if (!startDate || !endDate) return null;

  const durationDays = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1);
  const previousWindowEnd = startOfDay(addDays(startDate, -1));
  const previousWindowStart = startOfDay(addDays(previousWindowEnd, -(durationDays - 1)));

  return {
    startDate: previousWindowStart,
    endDate: endOfDay(previousWindowEnd),
  };
};

export const getPreviousYearRange = (startDate?: Date, endDate?: Date): PeriodComparisonWindow | null => {
  if (!startDate || !endDate) return null;

  return {
    startDate: subYears(startDate, 1),
    endDate: subYears(endDate, 1),
  };
};

export const formatDateRangeLabel = (startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) return 'Todo o período';

  return `${format(startDate, 'dd/MM/yy', { locale: ptBR })} → ${format(endDate, 'dd/MM/yy', { locale: ptBR })}`;
};

