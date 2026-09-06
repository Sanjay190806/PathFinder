import { request } from '../apiClient';
import { BackupSnapshotV2 } from '../backup/backupRegistry';

export interface CloudSnapshotEnvelope {
  id?: string;
  data: BackupSnapshotV2;
  schemaVersion: number;
  clientVersion: string;
  deviceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CloudStatus {
  authenticated: boolean;
  userId: string;
  cloudEnabled: boolean;
  lastSyncedAt: string | null;
  deviceId: string | null;
  pendingOperations: number;
  conflictCount: number;
  mode: 'account_cloud_sync';
}

export const cloudApiClient = {
  status(deviceId?: string) {
    const suffix = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : '';
    return request<{ success: boolean } & CloudStatus>(`/cloud/sync/status${suffix}`);
  },
  getSnapshot() {
    return request<{ success: boolean; snapshot: CloudSnapshotEnvelope | null }>('/cloud/snapshot');
  },
  pushSnapshot(snapshot: BackupSnapshotV2, deviceId: string, deviceName: string) {
    return request<{ success: boolean; updatedAt: string }>('/cloud/snapshot', {
      method: 'POST',
      body: {
        data: snapshot,
        schemaVersion: snapshot.schemaVersion,
        clientVersion: snapshot.version,
        deviceId,
        deviceName,
      },
    });
  },
  mergeSnapshot(snapshot: BackupSnapshotV2, deviceId: string) {
    return request('/cloud/snapshot/merge', { method: 'POST', body: { data: snapshot, schemaVersion: snapshot.schemaVersion, deviceId } });
  },
};
