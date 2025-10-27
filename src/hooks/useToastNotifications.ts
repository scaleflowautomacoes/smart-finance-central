import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export const useToastNotifications = () => {
  const { toast } = useToast();

  const showSuccess = useCallback((message: string, description?: string) => {
    toast({
      title: "Sucesso",
      description: message,
      variant: "default",
    });
  }, [toast]);

  const showError = useCallback((message: string, description?: string) => {
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const showInfo = useCallback((message: string, description?: string) => {
    toast({
      title: "Informação",
      description: message,
      variant: "default",
    });
  }, [toast]);

  return {
    showSuccess,
    showError,
    showInfo,
  };
};