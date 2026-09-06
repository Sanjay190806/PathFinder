import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const syncPostSchema = z.object({
  userId: z.string().min(1),
  data: z.record(z.any())
});

const syncPushSchema = z.object({
  userId: z.string().min(1).optional(),
  snapshot: z.object({
    appName: z.string(),
    data: z.record(z.any()),
  }).passthrough(),
});

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function containsDangerousKeys(value: unknown, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) {
    if (seen.has(value)) return false;
    seen.add(value);
    return value.some((item) => containsDangerousKeys(item, seen));
  }

  if (!isPlainObject(value)) {
    return false;
  }

  if (seen.has(value)) return false;
  seen.add(value);

  return Object.keys(value).some((key) => (
    DANGEROUS_KEYS.has(key) || containsDangerousKeys(value[key], seen)
  ));
}

async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function handleSyncHealth(_req: Request, res: Response): Promise<void> {
  const databaseAvailable = await isDatabaseAvailable();

  res.status(200).json({
    success: true,
    mode: 'manual_db_snapshot',
    databaseAvailable,
    dbConnected: databaseAvailable,
    authEnabled: false,
    realMultiDeviceSync: false,
  });
}

export async function handlePullSync(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.query.userId as string) || 'local-user';

    const snapshot = await prisma.appSnapshot.findUnique({
      where: { userId }
    });

    if (!snapshot) {
      res.status(200).json({ data: null, message: 'No snapshot backup found for this user.' });
      return;
    }

    res.status(200).json({ data: snapshot.data, updatedAt: snapshot.updatedAt });
  } catch (error: any) {
    console.error('Pull sync error:', error);
    res.status(503).json({
      error: error?.message || 'Failed to load database backup.',
      code: 'database_unavailable'
    });
  }
}

export async function handlePullSnapshot(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.query.userId as string) || 'local-user';

    const snapshot = await prisma.appSnapshot.findUnique({
      where: { userId }
    });

    if (!snapshot) {
      res.status(200).json({
        success: true,
        snapshot: null,
        updatedAt: null,
        message: 'No snapshot backup found for this user.'
      });
      return;
    }

    const stored = snapshot.data as Record<string, unknown>;
    const normalizedSnapshot = stored?.appName && stored?.data
      ? stored
      : {
          appName: 'Sanju Career OS',
          version: 'legacy',
          schemaVersion: 1,
          createdAt: snapshot.updatedAt.toISOString(),
          mode: 'manual_db_snapshot',
          keysIncluded: Object.keys(stored || {}),
          keysMissing: [],
          data: stored || {},
        };

    res.status(200).json({
      success: true,
      snapshot: normalizedSnapshot,
      updatedAt: snapshot.updatedAt,
    });
  } catch (error: any) {
    console.error('Pull snapshot error:', error);
    res.status(503).json({
      success: false,
      error: error?.message || 'Failed to load database backup.',
      code: 'database_unavailable'
    });
  }
}

export async function handlePushSync(req: Request, res: Response): Promise<void> {
  try {
    if (containsDangerousKeys(req.body)) {
      res.status(400).json({ error: 'Suspicious prototype pollution payload rejected.' });
      return;
    }

    const parsed = syncPostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid backup JSON payload structure.' });
      return;
    }

    const { userId, data } = parsed.data;
    const result = await upsertSnapshot(userId, data);

    res.status(200).json({ success: true, updatedAt: result.updatedAt });
  } catch (error: any) {
    console.error('Push sync error:', error);
    res.status(503).json({
      error: error?.message || 'Failed to save snapshot to database.',
      code: 'database_unavailable'
    });
  }
}

export async function handlePushSnapshot(req: Request, res: Response): Promise<void> {
  try {
    if (containsDangerousKeys(req.body)) {
      res.status(400).json({ success: false, error: 'Suspicious prototype pollution payload rejected.' });
      return;
    }

    const parsed = syncPushSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid snapshot payload structure.' });
      return;
    }

    const userId = parsed.data.userId || 'local-user';
    const result = await upsertSnapshot(userId, parsed.data.snapshot);

    res.status(200).json({ success: true, updatedAt: result.updatedAt });
  } catch (error: any) {
    console.error('Push snapshot error:', error);
    res.status(503).json({
      success: false,
      error: error?.message || 'Failed to save snapshot to database.',
      code: 'database_unavailable'
    });
  }
}

async function upsertSnapshot(userId: string, data: Record<string, unknown>) {
  await prisma.user.upsert({
    where: { email: `${userId}@sanzzdream.com` },
    update: {},
    create: {
      id: userId,
      name: 'Sanju',
      email: `${userId}@sanzzdream.com`,
      college: 'RMD Engineering College',
      roleGoal: 'SWE / AI Engineer'
    }
  });

  return prisma.appSnapshot.upsert({
    where: { userId },
    update: {
      data: data as any
    },
    create: {
      userId,
      data: data as any
    }
  });
}
