
import { useToast } from '@/hooks/use-toast';

export const useToastNotifications = () => {
  const { toast } = useToast();

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: "Sucesso",
      description: message,
      variant: "default",
    });
  };

  const showError = (message: string, description?: string) => {
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast({
      title: "Informação",
      description: message,
      variant: "default",
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
  };
};
