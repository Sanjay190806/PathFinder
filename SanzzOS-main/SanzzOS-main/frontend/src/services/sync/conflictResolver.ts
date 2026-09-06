/**
 * Conflict resolution foundation for future account-based sync (v1.7).
 * Not wired to active UI in v1.6.4 — manual DB snapshot uses newer-timestamp fallback only.
 */
import { SyncConflict } from '../../types/sync';

export const conflictResolver = {
  resolve(
    conflict: SyncConflict,
    strategy: 'keep-local' | 'keep-cloud' | 'merge-latest'
  ): any {
    if (strategy === 'keep-local') {
      return conflict.localData;
    }
    if (strategy === 'keep-cloud') {
      return conflict.remoteData;
    }

    // Default fallback: compare timestamps
    const localTime = new Date(conflict.localUpdatedAt).getTime();
    const remoteTime = new Date(conflict.remoteUpdatedAt).getTime();
    return localTime >= remoteTime ? conflict.localData : conflict.remoteData;
  }
};
export default conflictResolver;
