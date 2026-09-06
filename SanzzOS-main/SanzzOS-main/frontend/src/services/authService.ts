import { request, authTokenStorage } from './apiClient';
import { AccountMode, AuthResponse, AuthUser } from '../types/auth';

export const authService = {
  async signup(input: { name: string; email: string; password: string; timezone?: string }): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/signup', { method: 'POST', body: input, auth: false });
    authTokenStorage.set(response.token);
    return response;
  },

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/login', { method: 'POST', body: input, auth: false });
    authTokenStorage.set(response.token);
    return response;
  },

  async restoreSession(): Promise<AuthUser | null> {
    if (!authTokenStorage.get()) return null;
    try {
      const response = await request<{ success: boolean; user: AuthUser }>('/auth/me');
      return response.user;
    } catch {
      authTokenStorage.clear();
      return null;
    }
  },

  async updateProfile(input: Partial<{ name: string; timezone: string; preferredMode: AccountMode; onboardingCompleted: boolean }>): Promise<AuthUser> {
    const response = await request<{ success: boolean; user: AuthUser }>('/auth/me', { method: 'PATCH', body: input });
    return response.user;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Stateless tokens are cleared locally even if the backend is offline.
    }
    authTokenStorage.clear();
  },

  initiateGoogleAuth(): void {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const googleAuthUrl = `${apiBaseUrl}/api/auth/google`;
    window.location.href = googleAuthUrl;
  },

  handleGoogleCallback(token: string): AuthResponse {
    authTokenStorage.set(token);
    // The user object will be fetched by calling /auth/me
    return { success: true, user: null as any, token };
  },
};
