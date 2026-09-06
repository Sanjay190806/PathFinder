import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(10).max(128),
  timezone: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(128),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  timezone: z.string().trim().max(80).optional(),
  preferredMode: z.enum(['local_only', 'manual_backup', 'account_cloud_sync', 'offline_pending_sync']).optional(),
  onboardingCompleted: z.boolean().optional(),
});
