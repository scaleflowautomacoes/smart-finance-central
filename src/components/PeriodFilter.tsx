
import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addDays, subDays, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type PeriodType = 'current' | 'next' | 'next3' | 'next6' | '7days' | '15days' | '30days' | '60days' | '90days' | '6months' | '1year' | 'custom' | 'specific-month' | 'jan-2024' | 'feb-2024' | 'mar-2024' | 'apr-2024' | 'may-2024' | 'jun-2024' | 'jul-2024' | 'aug-2024' | 'sep-2024' | 'oct-2024' | 'nov-2024' | 'dec-2024' | 'jan-2025' | 'feb-2025' | 'mar-2025' | 'apr-2025' | 'may-2025' | 'jun-2025' | 'jul-2025' | 'aug-2025' | 'sep-2025' | 'oct-2025' | 'nov-2025' | 'dec-2025' | 'jan-2026' | 'feb-2026' | 'mar-2026' | 'apr-2026' | 'may-2026' | 'jun-2026' | 'jul-2026' | 'aug-2026' | 'sep-2026' | 'oct-2026' | 'nov-2026' | 'dec-2026';

interface PeriodFilterProps {
  selectedPeriod: PeriodType;
  customStartDate?: Date;
  customEndDate?: Date;
  onPeriodChange: (period: PeriodType, startDate?: Date, endDate?: Date) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedPeriod,
  customStartDate,
  customEndDate,
  onPeriodChange
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isSpecificMonthOpen, setIsSpecificMonthOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(customStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(customEndDate);

  const getCurrentPeriodLabel = () => {
    const now = new Date();
    
    // Handle specific month periods
    if (selectedPeriod.includes('-')) {
      const [monthStr, yearStr] = selectedPeriod.split('-');
      const monthMap: Record<string, string> = {
        'jan': 'Janeiro', 'feb': 'Fevereiro', 'mar': 'Março', 'apr': 'Abril',
        'may': 'Maio', 'jun': 'Junho', 'jul': 'Julho', 'aug': 'Agosto',
        'sep': 'Setembro', 'oct': 'Outubro', 'nov': 'Novembro', 'dec': 'Dezembro'
      };
      return `${monthMap[monthStr]} ${yearStr}`;
    }
    
    switch (selectedPeriod) {
      case 'current':
        return format(now, 'MMMM yyyy', { locale: ptBR });
      case 'next':
        return format(addMonths(now, 1), 'MMMM yyyy', { locale: ptBR });
      case 'next3':
        return 'Próximos 3 meses';
      case 'next6':
        return 'Próximos 6 meses';
      case '7days':
        return 'Últimos 7 dias';
      case '15days':
        return 'Últimos 15 dias';
      case '30days':
        return 'Últimos 30 dias';
      case '60days':
        return 'Últimos 60 dias';
      case '90days':
        return 'Últimos 90 dias';
      case '6months':
        return 'Últimos 6 meses';
      case '1year':
        return 'Último ano';
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, 'dd/MM/yyyy')} - ${format(customEndDate, 'dd/MM/yyyy')}`;
        }
        return 'Período personalizado';
      default:
        return 'Selecionar período';
    }
  };

  const handlePeriodSelect = (period: PeriodType) => {
    if (period === 'custom') {
      setIsCustomOpen(true);
      return;
    }

    if (period === 'specific-month') {
      setIsSpecificMonthOpen(true);
      return;
    }

    // Handle specific month periods
    if (period.includes('-')) {
      const [monthStr, yearStr] = period.split('-');
      const monthMap: Record<string, number> = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
        'may': 4, 'jun': 5, 'jul': 6, 'aug': 7,
        'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      const year = parseInt(yearStr);
      const month = monthMap[monthStr];
      const startDate = startOfMonth(new Date(year, month));
      const endDate = endOfMonth(new Date(year, month));
      onPeriodChange(period, startDate, endDate);
      return;
    }
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'current':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'next':
        startDate = startOfMonth(addMonths(now, 1));
        endDate = endOfMonth(addMonths(now, 1));
        break;
      case 'next3':
        startDate = startOfMonth(addMonths(now, 1));
        endDate = endOfMonth(addMonths(now, 3));
        break;
      case 'next6':
        startDate = startOfMonth(addMonths(now, 1));
        endDate = endOfMonth(addMonths(now, 6));
        break;
      case '7days':
        startDate = subDays(now, 7);
        endDate = now;
        break;
      case '15days':
        startDate = subDays(now, 15);
        endDate = now;
        break;
      case '30days':
        startDate = subDays(now, 30);
        endDate = now;
        break;
      case '60days':
        startDate = subDays(now, 60);
        endDate = now;
        break;
      case '90days':
        startDate = subDays(now, 90);
        endDate = now;
        break;
      case '6months':
        startDate = subMonths(now, 6);
        endDate = now;
        break;
      case '1year':
        startDate = subMonths(now, 12);
        endDate = now;
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    onPeriodChange(period, startDate, endDate);
  };

  const handleCustomPeriodApply = () => {
    if (tempStartDate && tempEndDate) {
      onPeriodChange('custom', tempStartDate, tempEndDate);
      setIsCustomOpen(false);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Add previous year months
    for (let month = 0; month < 12; month++) {
      const year = currentDate.getFullYear() - 1;
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthLabels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      options.push({
        value: `${monthNames[month]}-${year}` as PeriodType,
        label: `${monthLabels[month]} ${year}`
      });
    }
    
    // Add current year months
    for (let month = 0; month < 12; month++) {
      const year = currentDate.getFullYear();
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthLabels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      options.push({
        value: `${monthNames[month]}-${year}` as PeriodType,
        label: `${monthLabels[month]} ${year}`
      });
    }
    
    // Add next year months
    for (let month = 0; month < 12; month++) {
      const year = currentDate.getFullYear() + 1;
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthLabels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      options.push({
        value: `${monthNames[month]}-${year}` as PeriodType,
        label: `${monthLabels[month]} ${year}`
      });
    }
    
    return options;
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedPeriod} onValueChange={handlePeriodSelect}>
        <SelectTrigger className="w-[220px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue>
            <span className="text-sm">{getCurrentPeriodLabel()}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80 overflow-y-auto bg-white border shadow-lg z-50">
          <SelectItem value="current">Mês atual</SelectItem>
          <SelectItem value="next">Próximo mês</SelectItem>
          <SelectItem value="next3">Próximos 3 meses</SelectItem>
          <SelectItem value="next6">Próximos 6 meses</SelectItem>
          
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-t mt-1">
            Períodos Específicos
          </div>
          {generateMonthOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-t mt-1">
            Períodos Relativos
          </div>
          <SelectItem value="7days">Últimos 7 dias</SelectItem>
          <SelectItem value="15days">Últimos 15 dias</SelectItem>
          <SelectItem value="30days">Últimos 30 dias</SelectItem>
          <SelectItem value="60days">Últimos 60 dias</SelectItem>
          <SelectItem value="90days">Últimos 90 dias</SelectItem>
          <SelectItem value="6months">Últimos 6 meses</SelectItem>
          <SelectItem value="1year">Último ano</SelectItem>
          
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-t mt-1">
            Personalizado
          </div>
          <SelectItem value="custom">Período personalizado</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Picker Dialog */}
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <div style={{ display: 'none' }} />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-sm font-medium">Selecionar período personalizado</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Data inicial</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {tempStartDate ? format(tempStartDate, 'dd/MM/yyyy') : 'Selecionar'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={tempStartDate}
                          onSelect={setTempStartDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Data final</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {tempEndDate ? format(tempEndDate, 'dd/MM/yyyy') : 'Selecionar'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={tempEndDate}
                          onSelect={setTempEndDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={handleCustomPeriodApply}
                    disabled={!tempStartDate || !tempEndDate}
                    className="flex-1"
                  >
                    Aplicar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCustomOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PeriodFilter;
