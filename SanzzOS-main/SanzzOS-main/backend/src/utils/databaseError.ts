import { env } from '../config/env.js';

export type DatabaseHealthCode =
  | 'ok'
  | 'database_unavailable'
  | 'invalid_credentials'
  | 'database_not_found'
  | 'connection_refused'
  | 'missing_database_url'
  | 'unknown_database_error';

export interface SafeDatabaseConfig {
  provider: 'postgresql';
  host?: string;
  port?: string;
  database?: string;
  user?: string;
}

export interface DatabaseErrorInfo {
  available: boolean;
  code: DatabaseHealthCode;
  message: string;
  safeConfig: SafeDatabaseConfig;
}

export function getSafeDatabaseConfig(databaseUrl = env.DATABASE_URL): SafeDatabaseConfig {
  const fallback: SafeDatabaseConfig = { provider: 'postgresql' };
  if (!databaseUrl) return fallback;

  try {
    const url = new URL(databaseUrl);
    return {
      provider: 'postgresql',
      host: url.hostname || undefined,
      port: url.port || undefined,
      database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
      user: url.username ? decodeURIComponent(url.username) : undefined,
    };
  } catch {
    return fallback;
  }
}

export function classifyDatabaseError(error: unknown): DatabaseErrorInfo {
  const safeConfig = getSafeDatabaseConfig();

  if (!env.DATABASE_URL) {
    return {
      available: false,
      code: 'missing_database_url',
      message: 'DATABASE_URL is missing. Add it to backend/.env before using account or cloud features.',
      safeConfig,
    };
  }

  const anyError = error as { code?: string; name?: string; message?: string };
  const message = anyError?.message || String(error || '');
  const code = anyError?.code;

  if (code === 'P1000' || /Authentication failed|credentials.*not valid|password authentication failed/i.test(message)) {
    return {
      available: false,
      code: 'invalid_credentials',
      message: 'PostgreSQL rejected the configured username/password. Check DATABASE_URL in backend/.env.',
      safeConfig,
    };
  }

  if (code === 'P1001' || /Can't reach database|ECONNREFUSED|connect ECONNREFUSED|Connection refused/i.test(message)) {
    return {
      available: false,
      code: 'connection_refused',
      message: 'Cannot reach PostgreSQL. Start the database service and verify host/port.',
      safeConfig,
    };
  }

  if (code === 'P1003' || /database .* does not exist/i.test(message)) {
    return {
      available: false,
      code: 'database_not_found',
      message: 'Configured PostgreSQL database does not exist. Create it or update DATABASE_URL.',
      safeConfig,
    };
  }

  if (anyError?.name === 'PrismaClientInitializationError' || /PrismaClientInitializationError/i.test(message)) {
    return {
      available: false,
      code: 'database_unavailable',
      message: 'Database is unavailable. Check PostgreSQL and DATABASE_URL.',
      safeConfig,
    };
  }

  return {
    available: false,
    code: 'unknown_database_error',
    message: 'Database check failed. Review PostgreSQL status and backend/.env.',
    safeConfig,
  };
}

export function isPrismaDatabaseError(error: unknown): boolean {
  const info = classifyDatabaseError(error);
  return info.code !== 'unknown_database_error' || (error as { name?: string })?.name?.startsWith('Prisma') === true;
}
