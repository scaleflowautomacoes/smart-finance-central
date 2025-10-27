import { useMemo } from 'react';

// UID mockado consistente para simular um usuário logado
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export const useMockUserId = () => {
  // Em um ambiente real, você usaria: const { user } = useAuth(); return user?.id;
  return useMemo(() => MOCK_USER_ID, []);
};