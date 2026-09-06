import { Response } from 'express';
import { classifyDatabaseError } from './databaseError.js';

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export function sendApiError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ success: false, error: { code, message }, code, message });
}

export function sendDatabaseUnavailable(res: Response, error: unknown): void {
  const info = classifyDatabaseError(error);
  console.error(`Database error: ${info.code} - ${info.message}`);
  res.status(503).json({
    success: false,
    error: {
      code: 'database_unavailable',
      message: 'Database is unavailable. You can continue Local-only mode.',
    },
  });
}

export function sendUnexpectedError(res: Response, error: unknown, fallback = 'Unexpected server error.'): void {
  console.error('Unexpected API error:', error instanceof Error ? error.message : error);
  sendApiError(res, 500, 'internal_server_error', fallback);
}

export function sendDuplicateEmail(res: Response): void {
  sendApiError(res, 409, 'email_already_exists', 'An account with this email already exists.');
}
