import { create } from 'zustand';
import { authService } from '../../services/authService';
import { AuthStatus, AuthUser } from '../../types/auth';

interface AuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  continueLocalOnly: () => void;
  updateUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'unauthenticated',
  isAuthenticated: false,
  user: null,
  error: null,
  initialize: async () => {
    set({ status: 'authenticating', error: null });
    const user = await authService.restoreSession();
    if (user) {
      set({ status: 'authenticated', isAuthenticated: true, user, error: null });
      return;
    }
    const localMode = localStorage.getItem('sanzz_os_account_mode_v1') === 'local_only';
    set({ status: localMode ? 'offline_local_mode' : 'unauthenticated', isAuthenticated: false, user: null });
  },
  login: async (email, password) => {
    set({ status: 'authenticating', error: null });
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('sanzz_os_account_mode_v1', 'account_cloud_sync');
      set({ status: 'authenticated', isAuthenticated: true, user: response.user, error: null });
    } catch (error) {
      set({ status: 'auth_error', isAuthenticated: false, error: error instanceof Error ? error.message : 'Login failed.' });
      throw error;
    }
  },
  signup: async (input) => {
    set({ status: 'authenticating', error: null });
    try {
      const response = await authService.signup(input);
      localStorage.setItem('sanzz_os_account_mode_v1', 'account_cloud_sync');
      set({ status: 'authenticated', isAuthenticated: true, user: response.user, error: null });
    } catch (error) {
      set({ status: 'auth_error', isAuthenticated: false, error: error instanceof Error ? error.message : 'Signup failed.' });
      throw error;
    }
  },
  continueLocalOnly: () => {
    localStorage.setItem('sanzz_os_account_mode_v1', 'local_only');
    set({ status: 'offline_local_mode', isAuthenticated: false, user: null, error: null });
  },
  updateUser: (user) => set({ user, status: 'authenticated', isAuthenticated: true }),
  logout: async () => {
    await authService.logout();
    localStorage.setItem('sanzz_os_account_mode_v1', 'local_only');
    set({ status: 'offline_local_mode', isAuthenticated: false, user: null, error: null });
  }
}));
