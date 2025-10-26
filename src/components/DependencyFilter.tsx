
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DependencyFilterProps {
  selectedDependency: string;
  onDependencyChange: (dependency: string) => void;
  workspace: 'PF' | 'PJ';
}

const DependencyFilter: React.FC<DependencyFilterProps> = ({
  selectedDependency,
  onDependencyChange,
  workspace
}) => {
  const dependencies = workspace === 'PJ' ? [
    'Infoprodutos',
    'Chips',
    'Automações',
    'Disparos',
    'Co-produção'
  ] : [];

  if (workspace === 'PF') {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>Dependência</Label>
      <Select value={selectedDependency} onValueChange={onDependencyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas as Dependências" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Dependências</SelectItem>
          {dependencies.map((dep) => (
            <SelectItem key={dep} value={dep}>
              {dep}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DependencyFilter;
