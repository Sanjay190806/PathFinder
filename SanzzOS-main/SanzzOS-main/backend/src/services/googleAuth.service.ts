import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { createAuthToken } from '../utils/token.js';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function isGoogleConfigured(): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleAuthUrl(): string {
  if (!isGoogleConfigured()) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env');
  }

  const scopes = ['openid', 'profile', 'email'].join(' ');
  const state = generateState();
  const redirectUri = env.GOOGLE_CALLBACK_URL;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes);
  url.searchParams.set('state', state);

  return url.toString();
}

export async function exchangeCodeForTokens(code: string): Promise<{ idToken: string; accessToken: string }> {
  if (!isGoogleConfigured()) {
    throw new Error('Google OAuth is not configured');
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${errorText}`);
  }

  const data = await response.json() as { id_token: string; access_token: string };
  return { idToken: data.id_token, accessToken: data.access_token };
}

export async function verifyIdToken(idToken: string): Promise<GoogleProfile> {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!response.ok) {
    throw new Error('Failed to verify Google ID token');
  }

  const data = await response.json() as GoogleProfile;
  
  if (!data.email || !data.id) {
    throw new Error('Invalid Google token: missing email or id');
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name || data.email.split('@')[0],
    picture: data.picture,
  };
}

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const existingUser = await prisma.user.findFirst({
    where: {
      provider: 'google',
      providerId: profile.id,
    },
  });

  if (existingUser) {
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        lastLoginAt: new Date(),
        avatarUrl: profile.picture || existingUser.avatarUrl,
      },
    });
    return { user: updatedUser, isNew: false };
  }

  // Check if email already exists with different provider
  const emailUser = await prisma.user.findUnique({
    where: { email: profile.email.toLowerCase() },
  });

  if (emailUser) {
    // Email already exists with email/password provider
    throw new Error('An account with this email already exists. Please log in with your password.');
  }

  const newUser = await prisma.user.create({
    data: {
      email: profile.email.toLowerCase(),
      name: profile.name,
      avatarUrl: profile.picture,
      provider: 'google',
      providerId: profile.id,
      passwordHash: null, // Google users don't have password
      preferredMode: 'account_cloud_sync',
      lastLoginAt: new Date(),
    },
  });

  return { user: newUser, isNew: true };
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
