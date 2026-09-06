const rawApiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiBaseUrl.endsWith('/api') ? rawApiBaseUrl : `${rawApiBaseUrl}/api`;
const AUTH_TOKEN_KEY = 'sanzz_os_auth_token_v1';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = options.auth === false ? null : localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (networkError) {
    // Network error: backend unreachable, CORS, or connection refused
    if (networkError instanceof TypeError && networkError.message === 'Failed to fetch') {
      throw new ApiError(
        `Backend is not reachable at ${API_BASE_URL}. Please ensure the backend is running on port 5000.`,
        0,
        'backend_unreachable'
      );
    }
    throw new ApiError(
      `Network error: ${networkError instanceof Error ? networkError.message : 'Unknown network error'}`,
      0,
      'network_error'
    );
  }

  if (!response.ok) {
    let message = `HTTP request failed with status: ${response.status}`;
    let code: string | undefined;

    try {
      const payload = await response.json();
      if (payload.error && typeof payload.error === 'object') {
        message = payload.error.message || payload.message || message;
        code = payload.error.code || payload.code;
      } else {
        message = payload.error || payload.message || message;
        code = payload.code;
      }
    } catch {
      const errorText = await response.text();
      if (errorText) message = errorText;
    }

    // Provide more specific error messages based on status code
    if (response.status === 401) {
      message = 'Authentication required. Please log in again.';
    } else if (response.status === 403) {
      message = 'Access denied. You do not have permission to perform this action.';
    } else if (response.status === 404) {
      message = `Endpoint not found: ${endpoint}. The API route may not exist.`;
    } else if (response.status === 409) {
      message = message || 'A resource with this identifier already exists.';
    } else if (response.status === 500) {
      message = 'Internal server error. Please check the backend logs.';
    } else if (response.status === 503) {
      if (code === 'invalid_credentials') {
        message = 'PostgreSQL rejected the configured credentials. Fix backend/.env DATABASE_URL.';
      } else if (code === 'connection_refused' || code === 'database_unavailable' || code === 'missing_database_url') {
        message = 'Account mode needs the database. PostgreSQL is not connected. You can continue Local-only.';
      } else {
        message = message || 'Service unavailable. The backend may be starting up or down.';
      }
    } else if (response.status === 501 && code === 'google_not_configured') {
      message = 'Google Sign-In is not configured yet. Use email/password or local-only mode.';
    }

    throw new ApiError(message, response.status, code);
  }

  return response.json() as Promise<T>;
}

export interface BackendHealthSummary {
  online: boolean;
  apiBase: string;
  database?: {
    available: boolean;
    code: string;
    message: string;
    safeConfig?: Record<string, string>;
  };
  providers?: {
    emailPassword: boolean;
    google: boolean;
  };
  error?: string;
}

export async function getBackendHealthSummary(): Promise<BackendHealthSummary> {
  try {
    const [healthResponse, configResponse] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/health`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(`${API_BASE_URL}/auth/config`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
    ]);

    if (healthResponse.status !== 'fulfilled' || !healthResponse.value.ok) {
      return { online: false, apiBase: API_BASE_URL, error: 'Backend health endpoint is unavailable.' };
    }

    const health = await healthResponse.value.json();
    const providers = configResponse.status === 'fulfilled' && configResponse.value.ok
      ? (await configResponse.value.json()).providers
      : undefined;

    return {
      online: true,
      apiBase: API_BASE_URL,
      database: health.database,
      providers,
    };
  } catch (error) {
    return { online: false, apiBase: API_BASE_URL, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const authTokenStorage = {
  key: AUTH_TOKEN_KEY,
  get(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

export async function checkBackendHealth(): Promise<{ online: boolean; apiBase: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      return { online: true, apiBase: API_BASE_URL };
    }
    return { online: false, apiBase: API_BASE_URL, error: `Health check returned ${response.status}` };
  } catch (error) {
    return { online: false, apiBase: API_BASE_URL, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
