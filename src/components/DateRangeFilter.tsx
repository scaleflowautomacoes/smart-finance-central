import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  PERIOD_PRESETS,
  PresetName,
  getDateRangeFromPreset,
} from '@/lib/financialPeriods';

interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  presetName?: PresetName;
  onRangeChange: (start: Date | undefined, end: Date | undefined, presetName: PresetName) => void;
  onClear: () => void;
}

interface Preset {
  name: PresetName;
  label: string;
  getRange: () => { start?: Date; end?: Date };
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

  const presets: Preset[] = PERIOD_PRESETS.map((preset) => ({
    name: preset.name,
    label: preset.label,
    getRange: () => getDateRangeFromPreset(preset.name),
  }));

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
    if (!start || !end) return 'Tudo';
    
    const startStr = format(start, 'dd/MM/yy', { locale: ptBR });
    const endStr = format(end, 'dd/MM/yy', { locale: ptBR });
    
    if (startStr === endStr) {
      return startStr;
    }
    
    return `${startStr} → ${endStr}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start rounded-2xl border-border/70 bg-surface/90 text-left font-normal shadow-sm backdrop-blur min-w-[220px] h-11",
            !startDate && "text-muted-foreground"
          )}
          >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{presetName === 'tudo' ? 'Todo o período' : formatRange(startDate, endDate)}</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto rounded-2xl border-border/70 bg-popover p-0 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.45)] z-50" 
        align="start"
        side={isMobile ? "bottom" : "bottom"}
        sideOffset={8}
      >
        <div className="space-y-4 p-4">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant={presetName === preset.name && !showCustomCalendar ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="min-h-[44px] justify-center rounded-xl text-sm"
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
            Limpar filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
export type { DateRangeState, PresetName } from '@/lib/financialPeriods';
