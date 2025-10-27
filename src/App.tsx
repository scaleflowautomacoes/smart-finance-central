import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Dividas from "./pages/Dividas";
import Relatorios from "./pages/Relatorios";
import Metas from "./pages/Metas";
import VeiculosManutencoes from "./pages/VeiculosManutencoes";
import Investimentos from "./pages/Investimentos";
import FluxoDeCaixa from "./pages/FluxoDeCaixa";
import Lucro from "./pages/Lucro";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* NOVOS MÓDULOS */}
            <Route path="/dividas" element={<Dividas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/veiculos" element={<VeiculosManutencoes />} />
            <Route path="/investimentos" element={<Investimentos />} />
            <Route path="/fluxo-de-caixa" element={<FluxoDeCaixa />} />
            <Route path="/lucro" element={<Lucro />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;