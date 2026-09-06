import { request } from '../apiClient';
import { BackupSnapshotV2 } from '../backup/backupRegistry';

export interface SyncHealthResponse {
  status: 'offline' | 'online';
  online: boolean;
  dbConnected: boolean;
  mode?: string;
  authEnabled?: boolean;
  realMultiDeviceSync?: boolean;
  latencyMs?: number;
}

const DEFAULT_USER_ID = 'local-user';

export const cloudSyncAdapter = {
  async getHealth(): Promise<SyncHealthResponse> {
    const started = Date.now();
    try {
      const data = await request<{
        success?: boolean;
        databaseAvailable?: boolean;
        dbConnected?: boolean;
        mode?: string;
        authEnabled?: boolean;
        realMultiDeviceSync?: boolean;
      }>('/sync/health');

      const dbConnected = Boolean(data.databaseAvailable ?? data.dbConnected);
      return {
        status: 'online',
        online: true,
        dbConnected,
        mode: data.mode || 'manual_db_snapshot',
        authEnabled: data.authEnabled ?? false,
        realMultiDeviceSync: data.realMultiDeviceSync ?? false,
        latencyMs: Date.now() - started,
      };
    } catch {
      return {
        status: 'offline',
        online: false,
        dbConnected: false,
        mode: 'manual_db_snapshot',
        authEnabled: false,
        realMultiDeviceSync: false,
      };
    }
  },

  async pushSnapshot(snapshot: BackupSnapshotV2, userId: string = DEFAULT_USER_ID): Promise<boolean> {
    try {
      await request<{ success: boolean }>('/sync/push', {
        method: 'POST',
        body: { userId, snapshot },
      });
      return true;
    } catch (e) {
      console.warn('Failed pushing snapshot to backend database:', e);
      return false;
    }
  },

  async pullSnapshot(userId: string = DEFAULT_USER_ID): Promise<BackupSnapshotV2 | null> {
    try {
      const data = await request<{ success: boolean; snapshot: BackupSnapshotV2 | null }>(
        `/sync/pull?userId=${encodeURIComponent(userId)}`
      );
      return data.snapshot || null;
    } catch (e) {
      console.warn('Failed pulling snapshot from backend database:', e);
      return null;
    }
  },
};

export default cloudSyncAdapter;
