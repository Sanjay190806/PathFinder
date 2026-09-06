import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../config/env.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(unsignedToken: string): string {
  return createHmac('sha256', env.JWT_SECRET).update(unsignedToken).digest('base64url');
}

export function createAuthToken(payload: { sub: string; email: string }): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const body = base64UrlEncode({ ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS });
  const unsignedToken = `${header}.${body}`;
  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAuthToken(token: string): { sub: string; email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const unsignedToken = `${header}.${body}`;
  const expected = sign(unsignedToken);
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (provided.length !== expectedBuffer.length || !timingSafeEqual(provided, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      sub?: string;
      email?: string;
      exp?: number;
    };
    if (!payload.sub || !payload.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
