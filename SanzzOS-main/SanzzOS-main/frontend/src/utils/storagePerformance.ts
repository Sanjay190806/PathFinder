export const storagePerformance = {
  safeGetJSON<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(key);
      if (val) {
        return JSON.parse(val) as T;
      }
    } catch (e) {
      console.error(`Failed parsing storage key ${key}:`, e);
    }
    return defaultValue;
  },

  safeSetJSON<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Failed writing storage key ${key}:`, e);
      return false;
    }
  },

  safeRemove(key: string): void {
    localStorage.removeItem(key);
  },

  validateStorageHealth(): { healthy: boolean; corruptedKeys: string[]; totalSizeKB: number } {
    const corruptedKeys: string[] = [];
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        totalSize += val.length * 2; // UTF-16 characters

        // Test JSON parsing for app tracking structures
        if (key.includes('sanju') || key.includes('sanzz')) {
          try {
            JSON.parse(val);
          } catch (e) {
            corruptedKeys.push(key);
          }
        }
      }
    }

    return {
      healthy: corruptedKeys.length === 0,
      corruptedKeys,
      totalSizeKB: Math.round((totalSize / 1024) * 100) / 100
    };
  }
};
export default storagePerformance;
