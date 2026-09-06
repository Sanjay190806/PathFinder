export interface MigrationRecord {
  storeName: string;
  version: string | number;
  migratedAt: string;
  success: boolean;
  notes: string;
}

export function logMigration(record: MigrationRecord): void {
  try {
    const raw = localStorage.getItem('sanju-career-os-migrations');
    const logs: MigrationRecord[] = raw ? JSON.parse(raw) : [];
    logs.push(record);
    localStorage.setItem('sanju-career-os-migrations', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log migration', e);
  }
}

export function getMigrationLogs(): MigrationRecord[] {
  try {
    const raw = localStorage.getItem('sanju-career-os-migrations');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function backupStoreState(storeName: string): void {
  try {
    const raw = localStorage.getItem(storeName);
    if (raw) {
      const backupKey = `${storeName}-backup-${Date.now()}`;
      localStorage.setItem(backupKey, raw);
    }
  } catch (e) {
    console.error(`Failed to backup store ${storeName}`, e);
  }
}

export function clearAllLocalData(): void {
  try {
    // Collect all stores mapped in the app
    const keysToClear = [
      'sanju-career-os-persist',
      'sanju-ai-settings-persist-v3',
      'sanju-shayla-agent-persist-v1',
      'sanju-career-os-ui-state',
      'sanju-benchmark-persist',
      'sanju-comparison-persist',
      'sanju-feedback-persist',
      'sanju-interview-persist',
      'sanju-resume-studio-persist',
      'sanju-ai-persist'
    ];
    keysToClear.forEach((key) => {
      backupStoreState(key);
      localStorage.removeItem(key);
    });
    localStorage.removeItem('sanju-career-os-migrations');
  } catch (e) {
    console.error('Failed to clear all local data', e);
  }
}

export function resetIndividualStore(storeName: string): void {
  try {
    backupStoreState(storeName);
    localStorage.removeItem(storeName);
  } catch (e) {
    console.error(`Failed to reset store ${storeName}`, e);
  }
}
