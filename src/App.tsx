import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dividas from "./pages/Dividas";
import Relatorios from "./pages/Relatorios";
import Metas from "./pages/Metas";
import VeiculosManutencoes from "./pages/VeiculosManutencoes";
import Investimentos from "./pages/Investimentos";
import FluxoDeCaixa from "./pages/FluxoDeCaixa";
import Lucro from "./pages/Lucro";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* NOVOS MÓDULOS */}
            <Route path="/dividas" element={<ProtectedRoute><Dividas /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/metas" element={<ProtectedRoute><Metas /></ProtectedRoute>} />
            <Route path="/veiculos" element={<ProtectedRoute><VeiculosManutencoes /></ProtectedRoute>} />
            <Route path="/investimentos" element={<ProtectedRoute><Investimentos /></ProtectedRoute>} />
            <Route path="/fluxo-de-caixa" element={<ProtectedRoute><FluxoDeCaixa /></ProtectedRoute>} />
            <Route path="/lucro" element={<ProtectedRoute><Lucro /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;