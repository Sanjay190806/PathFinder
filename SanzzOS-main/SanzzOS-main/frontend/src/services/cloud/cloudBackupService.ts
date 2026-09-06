import { request } from '../apiClient';
import { BackupSnapshotV2, collectBackupData } from '../backup/backupRegistry';

export interface CloudBackupListItem {
  id: string;
  name: string;
  schemaVersion: number;
  clientVersion: string;
  createdAt: string;
}

export const cloudBackupService = {
  async list(): Promise<CloudBackupListItem[]> {
    const response = await request<{ success: boolean; backups: CloudBackupListItem[] }>('/cloud/backups');
    return response.backups;
  },
  async create(name?: string): Promise<CloudBackupListItem> {
    const snapshot = collectBackupData();
    const response = await request<{ success: boolean; backup: CloudBackupListItem }>('/cloud/backups', {
      method: 'POST',
      body: { name, data: snapshot, schemaVersion: snapshot.schemaVersion, clientVersion: snapshot.version },
    });
    return response.backup;
  },
  async get(id: string): Promise<BackupSnapshotV2> {
    const response = await request<{ success: boolean; backup: { data: BackupSnapshotV2 } }>(`/cloud/backups/${id}`);
    return response.backup.data;
  },
  async restore(id: string): Promise<BackupSnapshotV2> {
    const response = await request<{ success: boolean; snapshot: BackupSnapshotV2 }>(`/cloud/backups/${id}/restore`, { method: 'POST' });
    return response.snapshot;
  },
  async delete(id: string): Promise<void> {
    await request(`/cloud/backups/${id}`, { method: 'DELETE' });
  },
};
