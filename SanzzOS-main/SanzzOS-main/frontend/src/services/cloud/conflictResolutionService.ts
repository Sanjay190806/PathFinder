import { BackupSnapshotV2 } from '../backup/backupRegistry';

export type ConflictDecision = 'keep_local' | 'keep_cloud' | 'export_both' | 'cancel';

export interface SnapshotConflictSummary {
  conflict: boolean;
  localUpdatedAt: string;
  cloudUpdatedAt: string | null;
  reason: string;
}

export function detectSnapshotConflict(localSnapshot: BackupSnapshotV2, cloudUpdatedAt?: string | null): SnapshotConflictSummary {
  if (!cloudUpdatedAt) {
    return { conflict: false, localUpdatedAt: localSnapshot.createdAt, cloudUpdatedAt: null, reason: 'No cloud snapshot exists.' };
  }
  const localTime = new Date(localSnapshot.createdAt).getTime();
  const cloudTime = new Date(cloudUpdatedAt).getTime();
  const lastSync = localStorage.getItem('sanzz_os_last_sync_v1');
  const lastSyncTime = lastSync ? new Date(lastSync).getTime() : 0;
  const conflict = localTime > lastSyncTime && cloudTime > lastSyncTime && Math.abs(localTime - cloudTime) > 1000;
  return {
    conflict,
    localUpdatedAt: localSnapshot.createdAt,
    cloudUpdatedAt,
    reason: conflict ? 'Local and cloud data both changed since the last sync.' : 'No conflicting edits detected.',
  };
}
