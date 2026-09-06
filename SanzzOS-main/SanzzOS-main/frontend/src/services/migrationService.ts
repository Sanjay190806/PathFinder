import { BackupSnapshotV2, collectBackupData, restoreBackupData, savePreRestoreBackup } from './backup/backupRegistry';
import { cloudApiClient } from './cloud/cloudApiClient';
import { cloudSyncService } from './cloud/cloudSyncService';

export interface MigrationSummary {
  localKeyCount: number;
  cloudKeyCount: number;
  cloudUpdatedAt: string | null;
  localCreatedAt: string;
  hasLocalData: boolean;
  hasCloudData: boolean;
}

export const migrationService = {
  async summarize(): Promise<MigrationSummary> {
    const local = collectBackupData();
    const cloud = await cloudApiClient.getSnapshot();
    const cloudData = cloud.snapshot?.data as BackupSnapshotV2 | undefined;
    return {
      localKeyCount: local.keysIncluded.length,
      cloudKeyCount: cloudData?.keysIncluded?.length || 0,
      cloudUpdatedAt: cloud.snapshot?.updatedAt || null,
      localCreatedAt: local.createdAt,
      hasLocalData: local.keysIncluded.length > 0,
      hasCloudData: Boolean(cloud.snapshot),
    };
  },
  async uploadLocal() {
    savePreRestoreBackup();
    return cloudSyncService.pushLocalSnapshot();
  },
  async replaceLocalWithCloud() {
    savePreRestoreBackup();
    return cloudSyncService.pullCloudSnapshot();
  },
  async mergeLocalAndCloud() {
    return { success: false, conflictDetected: true, error: 'Automatic merge is intentionally disabled for v1.7. Export both or choose local/cloud.' };
  },
  keepLocalOnly() {
    localStorage.setItem('sanzz_os_account_mode_v1', 'local_only');
    localStorage.setItem('sanzz_os_sync_mode_v1', 'local-only');
    window.dispatchEvent(new Event('sync_config_changed'));
  },
  restoreLocal(raw: unknown) {
    savePreRestoreBackup();
    return restoreBackupData(raw);
  },
};
