import { useEffect } from 'react';
import { useAuthStore } from '../app/store/useAuthStore';

export function useAuth() {
  const auth = useAuthStore();

  useEffect(() => {
    if (auth.status === 'unauthenticated') {
      auth.initialize();
    }
  }, []);

  return auth;
}
