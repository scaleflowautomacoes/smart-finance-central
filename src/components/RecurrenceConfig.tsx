
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Repeat } from 'lucide-react';

interface RecurrenceConfigProps {
  isRecorrente: boolean;
  recorrenciaTipo: string;
  totalOcorrencias: string;
  onRecorrenteChange: (value: boolean) => void;
  onTipoChange: (value: string) => void;
  onOcorrenciasChange: (value: string) => void;
}

const RecurrenceConfig: React.FC<RecurrenceConfigProps> = ({
  isRecorrente,
  recorrenciaTipo,
  totalOcorrencias,
  onRecorrenteChange,
  onTipoChange,
  onOcorrenciasChange
}) => {
  const getPresetOcorrencias = (tipo: string) => {
    switch (tipo) {
      case 'mensal':
        return [
          { value: '6', label: '6 meses (Semestral)' },
          { value: '12', label: '12 meses (Anual)' },
          { value: '24', label: '24 meses (Bienal)' }
        ];
      case 'semanal':
        return [
          { value: '4', label: '4 semanas (1 mês)' },
          { value: '12', label: '12 semanas (3 meses)' },
          { value: '26', label: '26 semanas (6 meses)' },
          { value: '52', label: '52 semanas (1 ano)' }
        ];
      case 'quinzenal':
        return [
          { value: '12', label: '12 quinzenas (6 meses)' },
          { value: '24', label: '24 quinzenas (1 ano)' }
        ];
      case 'diaria':
        return [
          { value: '30', label: '30 dias (1 mês)' },
          { value: '90', label: '90 dias (3 meses)' },
          { value: '365', label: '365 dias (1 ano)' }
        ];
      case 'anual':
        return [
          { value: '2', label: '2 anos' },
          { value: '3', label: '3 anos' },
          { value: '5', label: '5 anos' }
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Repeat className="h-5 w-5 text-blue-600" />
          <span>Configuração de Recorrência</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="is_recorrente" className="text-sm font-medium">
            Esta é uma transação recorrente?
          </Label>
          <Switch
            id="is_recorrente"
            checked={isRecorrente}
            onCheckedChange={onRecorrenteChange}
          />
        </div>

        {isRecorrente && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recorrencia_tipo">Frequência da Recorrência</Label>
                <Select value={recorrenciaTipo} onValueChange={onTipoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diaria">Diária</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_ocorrencias">Número de Ocorrências</Label>
                <div className="flex space-x-2">
                  <Input
                    id="total_ocorrencias"
                    type="number"
                    min="1"
                    max="999"
                    value={totalOcorrencias}
                    onChange={(e) => onOcorrenciasChange(e.target.value)}
                    placeholder="Ex: 12"
                    className="flex-1"
                  />
                  {recorrenciaTipo && (
                    <Select value={totalOcorrencias} onValueChange={onOcorrenciasChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Presets" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPresetOcorrencias(recorrenciaTipo).map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {recorrenciaTipo && totalOcorrencias && (
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Resumo: {totalOcorrencias} transações {recorrenciaTipo === 'diaria' ? 'diárias' : 
                              recorrenciaTipo === 'semanal' ? 'semanais' : 
                              recorrenciaTipo === 'quinzenal' ? 'quinzenais' : 
                              recorrenciaTipo === 'mensal' ? 'mensais' : 'anuais'} serão criadas automaticamente.
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecurrenceConfig;
