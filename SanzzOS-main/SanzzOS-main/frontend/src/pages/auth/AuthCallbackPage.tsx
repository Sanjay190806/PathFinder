import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLoadingFallback } from '../../components/ui/PageLoadingFallback';
import { useAuthStore } from '../../app/store/useAuthStore';
import { authService } from '../../services/authService';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { initialize } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Redirect to login with error
      window.history.replaceState({}, '', `/login?error=${encodeURIComponent(error)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    if (token) {
      // Handle successful Google auth callback
      authService.handleGoogleCallback(token);
      // Fetch user profile and update store
      initialize().then(() => {
        const redirectPath = searchParams.get('isNew') === 'true' ? '/onboarding' : '/settings';
        window.history.replaceState({}, '', redirectPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    } else {
      // No token, redirect to login
      window.history.replaceState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [searchParams, initialize]);

  return <PageLoadingFallback />;
};
