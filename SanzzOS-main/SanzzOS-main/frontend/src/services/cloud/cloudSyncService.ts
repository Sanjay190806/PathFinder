import { collectBackupData, restoreBackupData, savePreRestoreBackup } from '../backup/backupRegistry';
import { cloudApiClient, CloudStatus } from './cloudApiClient';
import { detectSnapshotConflict } from './conflictResolutionService';
import { getDeviceName, getOrCreateDeviceId } from '../../hooks/useDeviceId';

export interface AccountSyncResult {
  success: boolean;
  conflictDetected: boolean;
  message?: string;
  error?: string;
}

export const cloudSyncService = {
  async getStatus(): Promise<CloudStatus | null> {
    try {
      return await cloudApiClient.status(getOrCreateDeviceId());
    } catch {
      return null;
    }
  },

  async pushLocalSnapshot(): Promise<AccountSyncResult> {
    const snapshot = collectBackupData();
    const remote = await cloudApiClient.getSnapshot();
    const conflict = detectSnapshotConflict(snapshot, remote.snapshot?.updatedAt || null);
    if (conflict.conflict && !window.confirm(`${conflict.reason}\n\nKeep local and overwrite cloud snapshot?`)) {
      return { success: false, conflictDetected: true, error: 'Cloud push cancelled.' };
    }

    const result = await cloudApiClient.pushSnapshot(snapshot, getOrCreateDeviceId(), getDeviceName());
    localStorage.setItem('sanzz_os_last_sync_v1', result.updatedAt);
    localStorage.setItem('sanzz_os_sync_mode_v1', 'cloud-sync');
    window.dispatchEvent(new Event('sync_config_changed'));
    return { success: true, conflictDetected: conflict.conflict, message: 'Local backup snapshot pushed to your account.' };
  },

  async pullCloudSnapshot(): Promise<AccountSyncResult> {
    const remote = await cloudApiClient.getSnapshot();
    if (!remote.snapshot) {
      return { success: false, conflictDetected: false, error: 'No cloud snapshot exists for this account yet.' };
    }
    if (!window.confirm('This will save a pre-restore local backup, then replace matching local app data with the cloud snapshot. Continue?')) {
      return { success: false, conflictDetected: true, error: 'Cloud pull cancelled.' };
    }
    savePreRestoreBackup();
    const result = restoreBackupData(remote.snapshot.data);
    if (!result.success) {
      return { success: false, conflictDetected: false, error: result.error || 'Cloud restore failed.' };
    }
    localStorage.setItem('sanzz_os_last_sync_v1', remote.snapshot.updatedAt);
    window.dispatchEvent(new Event('sync_config_changed'));
    return { success: true, conflictDetected: false, message: `Cloud snapshot restored. ${result.restoredKeys.length} keys updated.` };
  },
};
