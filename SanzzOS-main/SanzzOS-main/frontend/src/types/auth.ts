export type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated' | 'auth_error' | 'offline_local_mode';
export type AccountMode = 'local_only' | 'manual_backup' | 'account_cloud_sync' | 'offline_pending_sync';
export type AuthProvider = 'email' | 'google' | null;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  provider?: AuthProvider;
  timezone: string;
  preferredMode: AccountMode;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  token: string;
}
