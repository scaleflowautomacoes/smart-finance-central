
import React from 'react';
import { Building2, User, Plus, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentWorkspace: 'PF' | 'PJ';
  onWorkspaceChange: (workspace: 'PF' | 'PJ') => void;
  onNewTransaction: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentWorkspace, 
  onWorkspaceChange, 
  onNewTransaction 
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-foreground">Central Financeira</h1>
            
            {/* Workspace Switcher - Mais Destacado */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1 border">
              <Button
                variant={currentWorkspace === 'PF' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onWorkspaceChange('PF')}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="font-medium">Pessoa Física</span>
              </Button>
              <Button
                variant={currentWorkspace === 'PJ' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onWorkspaceChange('PJ')}
                className="flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Pessoa Jurídica</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </Link>
            <Button 
              onClick={onNewTransaction} 
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Transação</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
        
        {/* Indicador de Contexto */}
        <div className="mt-3 flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${
            currentWorkspace === 'PF' ? 'bg-primary' : 'bg-secondary'
          }`} />
          <span className="text-sm text-muted-foreground">
            Visualizando dados de {currentWorkspace === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
