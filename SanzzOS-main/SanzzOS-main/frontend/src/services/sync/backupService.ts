import {
  collectBackupData,
  restoreBackupData,
  validateBackupData,
  getBackupStorageSizeKB,
  BackupSnapshotV2,
  RestoreResultV2,
} from '../backup/backupRegistry';
import { markBackupExported } from '../../utils/applicationCrmUtils';

export const backupService = {
  exportData(): void {
    const snapshot = collectBackupData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sanzz_os_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    markBackupExported();
  },

  validateBackup(json: unknown) {
    return validateBackupData(json);
  },

  restoreBackup(snapshot: BackupSnapshotV2 | unknown): RestoreResultV2 {
    return restoreBackupData(snapshot);
  },

  getStorageSizeKB(): number {
    return getBackupStorageSizeKB();
  },
};

export default backupService;
