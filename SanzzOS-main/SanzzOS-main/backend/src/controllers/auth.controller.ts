import { Request, Response } from 'express';
import { login, signup, getUser, updateUser } from '../services/auth.service.js';
import { loginSchema, profileUpdateSchema, signupSchema } from '../validators/auth.validator.js';
import { getGoogleAuthUrl, exchangeCodeForTokens, verifyIdToken, findOrCreateGoogleUser, isGoogleConfigured } from '../services/googleAuth.service.js';
import { createAuthToken } from '../utils/token.js';
import { classifyDatabaseError, isPrismaDatabaseError } from '../utils/databaseError.js';
import { sendApiError, sendDatabaseUnavailable, sendDuplicateEmail, sendUnexpectedError } from '../utils/apiError.js';

function handleAuthError(res: Response, error: unknown): void {
  const anyError = error as { code?: string; message?: string };
  if (anyError?.code === 'P2002') {
    sendDuplicateEmail(res);
    return;
  }

  if (isPrismaDatabaseError(error)) {
    sendDatabaseUnavailable(res, error);
    return;
  }

  sendUnexpectedError(res, error, 'Authentication service failed.');
}

export async function handleSignup(req: Request, res: Response): Promise<void> {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid signup details.', code: 'invalid_signup' });
    return;
  }

  try {
    const result = await signup(parsed.data);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: { code: 'email_already_exists', message: result.error }, code: 'email_already_exists', message: result.error });
      return;
    }

    res.status(201).json({ success: true, user: result.user, token: result.token });
  } catch (error) {
    handleAuthError(res, error);
  }
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid login details.', code: 'invalid_login' });
    return;
  }

  try {
    const result = await login(parsed.data);
    if (!result.ok) {
      sendApiError(res, result.status, 'invalid_credentials', result.error);
      return;
    }

    res.status(200).json({ success: true, user: result.user, token: result.token });
  } catch (error) {
    handleAuthError(res, error);
  }
}

export async function handleMe(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user ? await getUser(req.user.id) : null;
    if (!user) {
      sendApiError(res, 401, 'auth_required', 'Authentication required.');
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    handleAuthError(res, error);
  }
}

export async function handleUpdateMe(req: Request, res: Response): Promise<void> {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success || !req.user) {
    sendApiError(res, 400, 'invalid_profile_update', 'Invalid profile update.');
    return;
  }

  try {
    const user = await updateUser(req.user.id, parsed.data);
    res.status(200).json({ success: true, user });
  } catch (error) {
    handleAuthError(res, error);
  }
}

export async function handleLogout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, message: 'Session cleared on this device.' });
}

export async function handleGoogleAuth(req: Request, res: Response): Promise<void> {
  if (!isGoogleConfigured()) {
    sendApiError(res, 501, 'google_not_configured', 'Google Sign-In is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env');
    return;
  }

  try {
    const authUrl = getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    sendUnexpectedError(res, error, 'Failed to initiate Google Sign-In.');
  }
}

export async function handleGoogleCallback(req: Request, res: Response): Promise<void> {
  const { code, error } = req.query;

  if (error) {
    // User cancelled or error occurred
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=google_cancelled`);
    return;
  }

  if (!code || typeof code !== 'string') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=google_no_code`);
    return;
  }

  try {
    const { idToken } = await exchangeCodeForTokens(code);
    const profile = await verifyIdToken(idToken);
    const { user, isNew } = await findOrCreateGoogleUser(profile);
    const token = createAuthToken({ sub: user.id, email: user.email || '' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&isNew=${isNew}`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const dbInfo = classifyDatabaseError(error);
    const errorMessage = isPrismaDatabaseError(error) ? dbInfo.code : error instanceof Error ? error.message : 'google_callback_failed';
    console.error('Google callback error:', errorMessage);
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`);
  }
}

export async function handleAuthConfig(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    providers: {
      emailPassword: true,
      google: isGoogleConfigured(),
    },
  });
}
