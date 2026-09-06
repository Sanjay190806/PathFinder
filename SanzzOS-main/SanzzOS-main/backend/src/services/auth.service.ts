import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createAuthToken } from '../utils/token.js';

function publicUser(user: {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  provider?: string | null;
  timezone: string;
  preferredMode: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    provider: user.provider || 'email',
    timezone: user.timezone,
    preferredMode: user.preferredMode,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function signup(input: { name: string; email: string; password: string; timezone?: string }) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, status: 409, error: 'An account with this email already exists.' };
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password),
      timezone: input.timezone || 'Asia/Kolkata',
      preferredMode: 'account_cloud_sync',
      lastLoginAt: new Date(),
    },
  });

  return { ok: true as const, user: publicUser(user), token: createAuthToken({ sub: user.id, email }) };
}

export async function login(input: { email: string; password: string }) {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return { ok: false as const, status: 401, error: 'Invalid email or password.' };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return { ok: false as const, status: 401, error: 'Invalid email or password.' };
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { ok: true as const, user: publicUser(updatedUser), token: createAuthToken({ sub: user.id, email }) };
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? publicUser(user) : null;
}

export async function updateUser(
  userId: string,
  input: { name?: string; timezone?: string; preferredMode?: string; onboardingCompleted?: boolean }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
  });
  return publicUser(user);
}
