import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { createBackup, getSnapshot, touchDevice, upsertSnapshot, validateCloudPayload } from '../services/cloudSync.service.js';
import { isPrismaDatabaseError } from '../utils/databaseError.js';
import { sendApiError, sendDatabaseUnavailable, sendUnexpectedError } from '../utils/apiError.js';

const snapshotSchema = z.object({
  data: z.record(z.any()),
  schemaVersion: z.number().int().positive().default(1),
  clientVersion: z.string().max(40).default('unknown'),
  deviceId: z.string().min(1).max(160).optional(),
  deviceName: z.string().max(160).optional(),
});

const backupSchema = snapshotSchema.extend({
  name: z.string().trim().min(1).max(120).optional(),
});

function requireUserId(req: Request, res: Response): string | null {
  if (!req.user?.id) {
    sendApiError(res, 401, 'auth_required', 'Authentication required.');
    return null;
  }
  return req.user.id;
}

function handleCloudError(res: Response, error: unknown): void {
  if (isPrismaDatabaseError(error)) {
    sendDatabaseUnavailable(res, error);
    return;
  }
  sendUnexpectedError(res, error, 'Cloud sync service failed.');
}

export async function handleCloudStatus(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const [snapshot, pendingOperations] = await Promise.all([
      getSnapshot(userId),
      prisma.syncEvent.count({ where: { userId, status: { not: 'synced' } } }),
    ]);

    res.status(200).json({
      success: true,
      authenticated: true,
      userId,
      cloudEnabled: true,
      lastSyncedAt: snapshot?.updatedAt || null,
      deviceId: req.query.deviceId || null,
      pendingOperations,
      conflictCount: 0,
      mode: 'account_cloud_sync',
    });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleGetSnapshot(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const snapshot = await getSnapshot(userId);
    res.status(200).json({
      success: true,
      snapshot: snapshot
        ? {
            id: snapshot.id,
            data: snapshot.data,
            schemaVersion: snapshot.schemaVersion,
            clientVersion: snapshot.clientVersion,
            deviceId: snapshot.deviceId,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt,
          }
        : null,
    });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handlePostSnapshot(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = snapshotSchema.safeParse(req.body);
  if (!parsed.success) {
    sendApiError(res, 400, 'invalid_cloud_snapshot', 'Invalid cloud snapshot payload.');
    return;
  }

  const payloadValidation = validateCloudPayload(parsed.data.data);
  if (!payloadValidation.ok) {
    sendApiError(res, 400, 'invalid_cloud_snapshot', payloadValidation.error);
    return;
  }

  try {
    const snapshot = await upsertSnapshot({ userId, ...parsed.data });
    res.status(200).json({ success: true, updatedAt: snapshot.updatedAt });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleMergeSnapshot(_req: Request, res: Response): Promise<void> {
  res.status(409).json({
    success: false,
    conflictRequired: true,
    error: { code: 'conflict_required', message: 'Automatic cloud merge is not enabled. Choose Keep local, Keep cloud, or export both backups in the client.' },
  });
}

export async function handleListBackups(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const backups = await prisma.backupSnapshot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, schemaVersion: true, clientVersion: true, createdAt: true },
    });
    res.status(200).json({ success: true, backups });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleCreateBackup(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = backupSchema.safeParse(req.body);
  if (!parsed.success) {
    sendApiError(res, 400, 'invalid_cloud_backup', 'Invalid cloud backup payload.');
    return;
  }

  const payloadValidation = validateCloudPayload(parsed.data.data);
  if (!payloadValidation.ok) {
    sendApiError(res, 400, 'invalid_cloud_backup', payloadValidation.error);
    return;
  }

  try {
    const backup = await createBackup({
      userId,
      name: parsed.data.name || `Cloud backup ${new Date().toISOString()}`,
      data: parsed.data.data,
      schemaVersion: parsed.data.schemaVersion,
      clientVersion: parsed.data.clientVersion,
    });

    res.status(201).json({
      success: true,
      backup: { id: backup.id, name: backup.name, createdAt: backup.createdAt, schemaVersion: backup.schemaVersion },
    });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleGetBackup(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const backup = await prisma.backupSnapshot.findFirst({ where: { id: req.params.id, userId } });
    if (!backup) {
      sendApiError(res, 404, 'cloud_backup_not_found', 'Cloud backup not found.');
      return;
    }
    res.status(200).json({ success: true, backup });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleRestoreBackup(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const backup = await prisma.backupSnapshot.findFirst({ where: { id: req.params.id, userId } });
    if (!backup) {
      sendApiError(res, 404, 'cloud_backup_not_found', 'Cloud backup not found.');
      return;
    }

    const snapshot = await upsertSnapshot({
      userId,
      data: backup.data,
      schemaVersion: backup.schemaVersion,
      clientVersion: backup.clientVersion,
      deviceId: typeof req.body?.deviceId === 'string' ? req.body.deviceId : undefined,
    });

    res.status(200).json({ success: true, restoredAt: snapshot.updatedAt, snapshot: snapshot.data });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleDeleteBackup(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const backup = await prisma.backupSnapshot.findFirst({ where: { id: req.params.id, userId } });
    if (!backup) {
      sendApiError(res, 404, 'cloud_backup_not_found', 'Cloud backup not found.');
      return;
    }
    await prisma.backupSnapshot.delete({ where: { id: backup.id } });
    res.status(200).json({ success: true });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleListDevices(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const devices = await prisma.userDevice.findMany({ where: { userId }, orderBy: { lastSeenAt: 'desc' } });
    res.status(200).json({ success: true, devices });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleUpdateDevice(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = z.object({
    deviceName: z.string().trim().min(1).max(160),
    browser: z.string().max(80).optional(),
    os: z.string().max(80).optional(),
  }).safeParse(req.body);
  if (!parsed.success) {
    sendApiError(res, 400, 'invalid_device_update', 'Invalid device update.');
    return;
  }

  try {
    const device = await touchDevice(userId, req.params.deviceId, parsed.data.deviceName, parsed.data.browser, parsed.data.os);
    res.status(200).json({ success: true, device });
  } catch (error) {
    handleCloudError(res, error);
  }
}

export async function handleDeleteDevice(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    await prisma.userDevice.deleteMany({ where: { userId, deviceId: req.params.deviceId } });
    res.status(200).json({ success: true });
  } catch (error) {
    handleCloudError(res, error);
  }
}
