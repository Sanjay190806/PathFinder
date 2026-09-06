import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const AuthGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => {
  const auth = useAuth();
  if (auth.status === 'authenticating') {
    return <div className="p-6 text-sm text-textSecondary">Restoring session...</div>;
  }
  if (auth.status !== 'authenticated') {
    return <>{fallback || null}</>;
  }
  return <>{children}</>;
};
