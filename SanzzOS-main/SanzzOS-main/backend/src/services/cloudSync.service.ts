import { prisma } from '../lib/prisma.js';

const MAX_SNAPSHOT_BYTES = 25 * 1024 * 1024;
const SECRET_PATTERN = /(api[_-]?key|secret|token|password|authorization|bearer|credential|groq)/i;

function jsonSize(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

function containsSecretLikeContent(value: unknown, path = ''): string | null {
  if (typeof value === 'string') {
    if (SECRET_PATTERN.test(path)) return path;
    if (/gsk_[A-Za-z0-9]{10,}/.test(value) || /sk-[A-Za-z0-9]{10,}/.test(value)) return path || 'payload';
    return null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = containsSecretLikeContent(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_PATTERN.test(key)) return key;
      const hit = containsSecretLikeContent(nested, path ? `${path}.${key}` : key);
      if (hit) return hit;
    }
  }
  return null;
}

export function validateCloudPayload(data: unknown): { ok: true } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Snapshot data must be an object.' };
  if (jsonSize(data) > MAX_SNAPSHOT_BYTES) return { ok: false, error: 'Snapshot payload is too large.' };
  const secretHit = containsSecretLikeContent(data);
  if (secretHit) return { ok: false, error: `Secret-like content rejected near "${secretHit}".` };
  return { ok: true };
}

export async function touchDevice(
  userId: string,
  deviceId?: string,
  deviceName = 'Unknown device',
  browser?: string,
  os?: string
) {
  if (!deviceId) return null;
  return prisma.userDevice.upsert({
    where: { userId_deviceId: { userId, deviceId } },
    update: { deviceName, browser, os, lastSeenAt: new Date() },
    create: { userId, deviceId, deviceName, browser, os },
  });
}

export async function getSnapshot(userId: string) {
  return prisma.userAppSnapshot.findUnique({ where: { userId } });
}

export async function upsertSnapshot(input: {
  userId: string;
  data: unknown;
  schemaVersion: number;
  clientVersion: string;
  deviceId?: string;
  deviceName?: string;
}) {
  await touchDevice(input.userId, input.deviceId, input.deviceName);
  const snapshot = await prisma.userAppSnapshot.upsert({
    where: { userId: input.userId },
    update: {
      data: input.data as any,
      schemaVersion: input.schemaVersion,
      clientVersion: input.clientVersion,
      deviceId: input.deviceId,
    },
    create: {
      userId: input.userId,
      data: input.data as any,
      schemaVersion: input.schemaVersion,
      clientVersion: input.clientVersion,
      deviceId: input.deviceId,
    },
  });
  await prisma.syncEvent.create({
    data: {
      userId: input.userId,
      deviceId: input.deviceId,
      entityType: 'app_snapshot',
      operationType: 'upsert',
      status: 'synced',
    },
  });
  return snapshot;
}

export async function createBackup(input: {
  userId: string;
  name: string;
  data: unknown;
  schemaVersion: number;
  clientVersion: string;
}) {
  return prisma.backupSnapshot.create({
    data: {
      userId: input.userId,
      name: input.name,
      data: input.data as any,
      schemaVersion: input.schemaVersion,
      clientVersion: input.clientVersion,
    },
  });
}
