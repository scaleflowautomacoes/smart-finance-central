import { useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// UID mockado consistente para simular um usuário logado
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export const useMockUserId = () => {
  const { user } = useAuth();
  
  // Retorna o ID do usuário real se estiver logado, caso contrário, retorna o mock ID.
  return useMemo(() => user?.id || MOCK_USER_ID, [user]);
};