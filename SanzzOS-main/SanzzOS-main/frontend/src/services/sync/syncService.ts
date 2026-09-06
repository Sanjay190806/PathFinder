import { request } from '../apiClient';
import { CareerState } from '../../types';
import {
  APP_NAME,
  BACKUP_SCHEMA_VERSION,
  BACKUP_VERSION,
  BackupSnapshotV2,
  collectBackupData,
  restoreBackupData,
  validateBackupData,
  formatBackupValidationSummary,
  getBackupStorageSizeKB,
  savePreRestoreBackup,
} from '../backup/backupRegistry';
import { cloudSyncAdapter } from './cloudSyncAdapter';
import { syncQueue } from './syncQueue';

export type SyncMode = 'local-only' | 'cloud-ready' | 'manual-db-snapshot' | 'cloud-sync';

const SYNC_MODE_KEY = 'sanzz_os_sync_mode_v1';
const LAST_SYNC_KEY = 'sanzz_os_last_sync_v1';
const DEFAULT_USER_ID = 'local-user';

export interface SyncHealthInfo {
  status: 'offline' | 'online' | 'syncing' | 'synced' | 'failed';
  online: boolean;
  dbConnected: boolean;
  mode: string;
  authEnabled: boolean;
  realMultiDeviceSync: boolean;
  latencyMs?: number;
}

export interface SyncOperationResult {
  success: boolean;
  conflictDetected: boolean;
  error?: string;
  message?: string;
}

export interface BackendHealth {
  api?: { status?: string };
  database?: { status?: string };
  groq?: { status?: string; model?: string };
  environment?: string;
  uptime?: number;
  timestamp?: string;
}

function migrateLegacyMode(mode: string | null): SyncMode {
  if (mode === 'cloud-ready' || mode === 'cloud-sync') return 'manual-db-snapshot';
  if (mode === 'manual-db-snapshot') return 'manual-db-snapshot';
  return 'local-only';
}

export const syncCoreService = {
  getSyncMode(): SyncMode {
    return migrateLegacyMode(localStorage.getItem(SYNC_MODE_KEY));
  },

  setSyncMode(mode: SyncMode): void {
    localStorage.setItem(SYNC_MODE_KEY, mode);
    window.dispatchEvent(new Event('sync_config_changed'));
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  },

  setLastSyncTime(time: string): void {
    localStorage.setItem(LAST_SYNC_KEY, time);
    window.dispatchEvent(new Event('sync_config_changed'));
  },

  getQueueLength(): number {
    return syncQueue.getOperations().filter((op) => op.status === 'pending' || op.status === 'failed').length;
  },

  async checkBackendHealth(): Promise<boolean> {
    try {
      const health = await this.getBackendHealth();
      return Boolean(health?.api?.status === 'ok' || health?.api?.status === 'healthy');
    } catch {
      return false;
    }
  },

  async getBackendHealth(): Promise<BackendHealth | null> {
    try {
      return await request<BackendHealth>('/health');
    } catch {
      return null;
    }
  },

  async getSyncHealth(): Promise<SyncHealthInfo> {
    const health = await cloudSyncAdapter.getHealth();
    return {
      status: health.online ? 'online' : 'offline',
      online: health.online,
      dbConnected: health.dbConnected,
      mode: health.mode || 'manual_db_snapshot',
      authEnabled: health.authEnabled ?? false,
      realMultiDeviceSync: health.realMultiDeviceSync ?? false,
      latencyMs: health.latencyMs,
    };
  },

  loadLocalBackup(): BackupSnapshotV2 {
    return collectBackupData();
  },

  getStorageSizeKB(): number {
    return getBackupStorageSizeKB();
  },

  validateBackup(raw: unknown) {
    return validateBackupData(raw);
  },

  formatBackupSummary(validation: ReturnType<typeof validateBackupData>): string {
    return formatBackupValidationSummary(validation);
  },

  restoreLocalBackup(raw: unknown) {
    return restoreBackupData(raw);
  },

  savePreRestoreBackup(): boolean {
    return savePreRestoreBackup();
  },

  async pushCareerSnapshot(userId: string, data: CareerState): Promise<{ success: boolean; updatedAt: string }> {
    return request<{ success: boolean; updatedAt: string }>('/sync', {
      method: 'POST',
      body: { userId, data },
    });
  },

  async pullCareerSnapshot(userId: string): Promise<CareerState | null> {
    try {
      const res = await request<{ data: CareerState | null }>(`/sync?userId=${encodeURIComponent(userId)}`);
      return res.data ? res.data : null;
    } catch {
      return null;
    }
  },

  async flushQueue(): Promise<SyncOperationResult> {
    const pending = syncQueue.getOperations().filter((op) => op.status === 'pending' || op.status === 'failed');
    if (pending.length === 0) {
      return { success: true, conflictDetected: false, message: 'No pending offline operations.' };
    }
    const result = await this.synchronize();
    if (result.success) {
      pending.forEach((op) => syncQueue.markSynced(op.id));
    }
    return result;
  },

  async synchronize(): Promise<SyncOperationResult> {
    const mode = this.getSyncMode();
    if (mode === 'local-only') {
      return {
        success: true,
        conflictDetected: false,
        message: 'Local-only mode: data stays in browser storage. Use Backup/Restore to move files manually.',
      };
    }

    const health = await cloudSyncAdapter.getHealth();
    if (!health.online || !health.dbConnected) {
      syncQueue.enqueue({
        entityType: 'settings',
        operationType: 'update',
        payload: { reason: 'db_snapshot_push' },
      });
      return {
        success: false,
        conflictDetected: false,
        error: health.online
          ? 'Database unavailable. Start PostgreSQL and run migrations, then retry.'
          : 'Backend offline. Snapshot queued locally until the server is available.',
      };
    }

    const localSnapshot = collectBackupData();

    const pushSuccess = await cloudSyncAdapter.pushSnapshot(localSnapshot);
    if (!pushSuccess) {
      syncQueue.enqueue({
        entityType: 'settings',
        operationType: 'update',
        payload: { reason: 'db_snapshot_push' },
      });
      return {
        success: false,
        conflictDetected: false,
        error: 'Failed to push manual database snapshot.',
      };
    }

    const remoteSnapshot = await cloudSyncAdapter.pullSnapshot();
    if (remoteSnapshot?.createdAt) {
      const localTime = new Date(localSnapshot.createdAt).getTime();
      const remoteTime = new Date(remoteSnapshot.createdAt).getTime();
      if (remoteTime > localTime) {
        restoreBackupData(remoteSnapshot);
        return {
          success: true,
          conflictDetected: false,
          message: 'Remote manual snapshot was newer and has been restored locally.',
        };
      }
    }

    syncQueue.clearCompleted();
    this.setLastSyncTime(new Date().toISOString());
    return {
      success: true,
      conflictDetected: false,
      message: 'Manual database snapshot pushed successfully. This is not account-based multi-device sync.',
    };
  },

  async pushFullSnapshot(userId: string = DEFAULT_USER_ID): Promise<{ success: boolean; updatedAt?: string; error?: string }> {
    const health = await this.getSyncHealth();
    if (!health.online || !health.dbConnected) {
      return { success: false, error: 'Backend or database unavailable.' };
    }

    const snapshot = collectBackupData();
    const ok = await cloudSyncAdapter.pushSnapshot(snapshot, userId);
    if (!ok) {
      return { success: false, error: 'Failed to push full backup snapshot.' };
    }

    this.setLastSyncTime(new Date().toISOString());
    return { success: true, updatedAt: new Date().toISOString() };
  },

  async pullFullSnapshot(userId: string = DEFAULT_USER_ID): Promise<{ success: boolean; error?: string }> {
    const health = await this.getSyncHealth();
    if (!health.online || !health.dbConnected) {
      return { success: false, error: 'Backend or database unavailable.' };
    }

    const remoteSnapshot = await cloudSyncAdapter.pullSnapshot(userId);
    if (!remoteSnapshot) {
      return { success: false, error: 'No database snapshot found for this user.' };
    }

    savePreRestoreBackup();
    const result = restoreBackupData(remoteSnapshot);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to restore database snapshot locally.' };
    }

    this.setLastSyncTime(new Date().toISOString());
    return { success: true };
  },

  getDefaultUserId(): string {
    return DEFAULT_USER_ID;
  },

  getAppVersion(): string {
    return BACKUP_VERSION;
  },

  getAppName(): string {
    return APP_NAME;
  },

  getSchemaVersion(): number {
    return BACKUP_SCHEMA_VERSION;
  },
};

export default syncCoreService;
