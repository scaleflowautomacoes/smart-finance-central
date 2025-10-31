import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export type PresetName = 'hoje' | 'ontem' | '7dias' | 'este-mes' | 'mes-passado' | 'este-ano' | 'custom';

export interface DateRangeState {
  startDate: Date;
  endDate: Date;
  presetName: PresetName;
}

interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  presetName?: PresetName;
  onRangeChange: (start: Date, end: Date, presetName: PresetName) => void;
  onClear: () => void;
}

interface Preset {
  name: PresetName;
  label: string;
  getRange: () => { start: Date; end: Date };
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  presetName = 'este-mes',
  onRangeChange,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const presets: Preset[] = [
    {
      name: 'hoje',
      label: 'Hoje',
      getRange: () => {
        const now = new Date();
        return { start: startOfDay(now), end: endOfDay(now) };
      },
    },
    {
      name: 'ontem',
      label: 'Ontem',
      getRange: () => {
        const yesterday = subDays(new Date(), 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      },
    },
    {
      name: '7dias',
      label: 'Últimos 7 dias',
      getRange: () => {
        const now = new Date();
        const sevenDaysAgo = subDays(now, 6);
        return { start: startOfDay(sevenDaysAgo), end: endOfDay(now) };
      },
    },
    {
      name: 'este-mes',
      label: 'Este mês',
      getRange: () => {
        const now = new Date();
        return { start: startOfMonth(now), end: endOfMonth(now) };
      },
    },
    {
      name: 'mes-passado',
      label: 'Mês passado',
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      },
    },
    {
      name: 'este-ano',
      label: 'Este ano',
      getRange: () => {
        const now = new Date();
        return { start: startOfYear(now), end: endOfYear(now) };
      },
    },
    {
      name: 'custom',
      label: 'Personalizado',
      getRange: () => {
        const now = new Date();
        return { start: startOfMonth(now), end: endOfMonth(now) };
      },
    },
  ];

  const handlePresetClick = (preset: Preset) => {
    if (preset.name === 'custom') {
      setShowCustomCalendar(true);
    } else {
      const { start, end } = preset.getRange();
      onRangeChange(start, end, preset.name);
      setShowCustomCalendar(false);
      setIsOpen(false);
    }
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onRangeChange(startOfDay(range.from), endOfDay(range.to), 'custom');
      setShowCustomCalendar(false);
      setIsOpen(false);
    }
  };

  const formatRange = (start?: Date, end?: Date) => {
    if (!start || !end) return 'Selecionar período';
    
    const startStr = format(start, 'dd/MM/yy', { locale: ptBR });
    const endStr = format(end, 'dd/MM/yy', { locale: ptBR });
    
    if (startStr === endStr) {
      return startStr;
    }
    
    return `${startStr} → ${endStr}`;
  };

  const currentPresetLabel = presets.find(p => p.name === presetName)?.label || 'Personalizado';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[200px] h-10",
            !startDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{formatRange(startDate, endDate)}</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 bg-popover border shadow-lg z-50" 
        align="start"
        side={isMobile ? "bottom" : "bottom"}
        sideOffset={8}
      >
        <div className="p-4 space-y-4">
          {/* Presets */}
          <div className="flex flex-col sm:flex-row gap-2">
            {presets.slice(0, 4).map((preset) => (
              <Button
                key={preset.name}
                variant={presetName === preset.name && !showCustomCalendar ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="min-h-[44px] justify-center text-sm"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {presets.slice(4).map((preset) => (
              <Button
                key={preset.name}
                variant={
                  preset.name === 'custom' 
                    ? (showCustomCalendar ? "default" : "outline")
                    : (presetName === preset.name && !showCustomCalendar ? "default" : "outline")
                }
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="min-h-[44px] justify-center text-sm"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendário Personalizado */}
          {showCustomCalendar && (
            <div className="border-t pt-4">
              <Calendar
                mode="range"
                numberOfMonths={isMobile ? 1 : 2}
                selected={startDate && endDate ? { from: startDate, to: endDate } : undefined}
                onSelect={handleDateSelect}
                className="pointer-events-auto"
                locale={ptBR}
              />
            </div>
          )}

          {/* Botão Limpar */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              onClear();
              setShowCustomCalendar(false);
              setIsOpen(false);
            }}
            className="w-full min-h-[44px] justify-center"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtro (Este mês)
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
