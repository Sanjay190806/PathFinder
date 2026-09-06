import { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../utils/token.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    res.status(401).json({ success: false, error: 'Authentication required.', code: 'auth_required' });
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired session.', code: 'invalid_session' });
    return;
  }

  req.user = { id: payload.sub, email: payload.email };
  next();
}
