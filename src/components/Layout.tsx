import React from 'react';
import { Building2, User, Plus, Settings, LogOut, Scale, TrendingUp, Target, Car, DollarSign, Briefcase, LayoutDashboard, Menu, Search, Bell, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Ação de logout simulada ou removida, pois não há autenticação real
  const handleLogout = () => {
    // Apenas redireciona para a raiz, pois não há sessão para encerrar
    navigate('/');
  };
  
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("flex h-full flex-col", isMobile ? "p-4" : "p-4 space-y-4")}>
      <div className="flex items-center gap-3 px-2 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Smart Finance</div>
          <h1 className="text-lg font-semibold text-foreground">Central Financeira</h1>
        </div>
      </div>
      
      {/* Workspace Switcher */}
      <div className="flex flex-col space-y-1 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/50 p-1.5 shadow-sm">
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
                className={cn(
                  "w-full justify-start rounded-xl transition-all",
                  isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="mt-auto space-y-1 border-t border-sidebar-border/70 pt-4">
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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar (Desktop) */}
      <nav className="hidden lg:flex flex-col w-[18rem] border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground sticky top-0 h-screen shadow-[0_0_0_1px_hsl(var(--sidebar-border)/0.45),0_24px_80px_-40px_rgba(0,0,0,0.8)]">
        <SidebarContent />
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 flex-col overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 border-border/70 bg-sidebar p-0 text-sidebar-foreground">
                  <SidebarContent isMobile={true} />
                </SheetContent>
              </Sheet>
              <Badge variant="outline" className="rounded-full border-border/60 bg-surface/80 px-3 py-1">
                {currentWorkspace}
              </Badge>
            </div>

            <div className="hidden flex-1 items-center gap-3 lg:flex">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border/70 bg-surface/80 px-4 py-2 shadow-sm backdrop-blur">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="Buscar"
                  placeholder="Buscar transações, metas, relatórios..."
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Badge variant="outline" className="rounded-full border-border/60 bg-surface/80 px-3 py-1">
                Workspace {currentWorkspace}
              </Badge>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle compact className="rounded-xl" />
              <Button 
                onClick={onNewTransaction} 
                size="sm"
                className="rounded-xl shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova transação</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-4 lg:px-6 lg:py-6">
            <div className="rounded-[calc(var(--radius)+0.5rem)] border border-border/40 bg-background/30 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
