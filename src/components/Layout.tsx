import React from 'react';
import { Building2, User, Plus, Settings, LogOut, Scale, TrendingUp, Target, Car, DollarSign, Briefcase, LayoutDashboard, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components

interface LayoutProps {
  children: React.ReactNode;
  currentWorkspace: 'PF' | 'PJ';
  onWorkspaceChange: (workspace: 'PF' | 'PJ') => void;
  onNewTransaction: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fluxo-de-caixa', icon: Briefcase, label: 'Fluxo de Caixa' },
  { to: '/lucro', icon: TrendingUp, label: 'Lucro (DRE)' },
  { to: '/relatorios', icon: TrendingUp, label: 'Relatórios' },
  { to: '/dividas', icon: Scale, label: 'Dívidas' },
  { to: '/metas', icon: Target, label: 'Metas' },
  { to: '/investimentos', icon: DollarSign, label: 'Investimentos' },
  { to: '/veiculos', icon: Car, label: 'Veículos' },
];

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentWorkspace, 
  onWorkspaceChange, 
  onNewTransaction 
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Ação de logout simulada ou removida, pois não há autenticação real
  const handleLogout = () => {
    // Apenas redireciona para a raiz, pois não há sessão para encerrar
    navigate('/');
  };
  
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col h-full ${isMobile ? 'p-4' : 'p-4 space-y-4'}`}>
      <h1 className="text-2xl font-bold text-foreground mb-4">Central Financeira</h1>
      
      {/* Workspace Switcher */}
      <div className="flex flex-col space-y-1 bg-muted rounded-lg p-1 border">
        <Button
          variant={currentWorkspace === 'PF' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => { onWorkspaceChange('PF'); if (isMobile) setIsMobileMenuOpen(false); }}
          className="flex items-center justify-start space-x-2"
        >
          <User className="h-4 w-4" />
          <span className="font-medium">Pessoa Física</span>
        </Button>
        <Button
          variant={currentWorkspace === 'PJ' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => { onWorkspaceChange('PJ'); if (isMobile) setIsMobileMenuOpen(false); }}
          className="flex items-center justify-start space-x-2"
        >
          <Building2 className="h-4 w-4" />
          <span className="font-medium">Pessoa Jurídica</span>
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col space-y-1 pt-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="mt-auto space-y-1 border-t pt-4">
        <ThemeToggle />
        <Link to="/settings" onClick={() => isMobile && setIsMobileMenuOpen(false)}>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-3" />
            Configurações
          </Button>
        </Link>
        <Button 
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair (Desativado)
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (Desktop) */}
      <nav className="hidden lg:flex flex-col w-64 border-r bg-card sticky top-0 h-screen">
        <SidebarContent />
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header (Mobile/Top Bar) */}
        <header className="lg:hidden bg-card border-b border-border px-4 py-3 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent isMobile={true} />
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-bold text-foreground">
              {currentWorkspace === 'PF' ? 'PF' : 'PJ'}
            </h1>
            
            <Button 
              onClick={onNewTransaction} 
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;