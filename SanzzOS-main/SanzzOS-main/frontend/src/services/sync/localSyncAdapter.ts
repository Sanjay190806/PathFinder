import {
  collectBackupData,
  restoreBackupData,
  getBackupStorageSizeKB,
} from '../backup/backupRegistry';

export const localSyncAdapter = {
  loadSnapshot() {
    return collectBackupData();
  },

  saveSnapshot(snapshot: Parameters<typeof restoreBackupData>[0]) {
    const result = restoreBackupData(snapshot);
    return {
      success: result.success,
      restoredKeys: result.restoredKeys,
    };
  },

  getStorageSizeKB(): number {
    return getBackupStorageSizeKB();
  },
};

export default localSyncAdapter;
