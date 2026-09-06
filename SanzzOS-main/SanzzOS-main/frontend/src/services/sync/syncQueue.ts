import { SyncOperation } from '../../types/sync';

const QUEUE_KEY = 'sanzz_os_sync_queue_v1';

export const syncQueue = {
  getOperations(): SyncOperation[] {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) return JSON.parse(stored) as SyncOperation[];
    } catch (e) {
      console.warn('Failed parsing sync queue:', e);
    }
    return [];
  },

  saveOperations(ops: SyncOperation[]): void {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
    window.dispatchEvent(new Event('sync_queue_changed'));
  },

  enqueue(op: Omit<SyncOperation, 'id' | 'createdAt' | 'status' | 'retries'>): void {
    const ops = this.getOperations();
    const newOp: SyncOperation = {
      ...op,
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retries: 0,
    };
    ops.push(newOp);
    this.saveOperations(ops);
  },

  markSynced(id: string): void {
    const ops = this.getOperations().map((op) => (
      op.id === id ? { ...op, status: 'synced' as const } : op
    ));
    this.saveOperations(ops);
  },

  clearCompleted(): void {
    const ops = this.getOperations().filter((op) => op.status !== 'synced');
    this.saveOperations(ops);
  },

  dequeue(id: string): void {
    const ops = this.getOperations().filter((op) => op.id !== id);
    this.saveOperations(ops);
  },

  clearQueue(): void {
    this.saveOperations([]);
  },
};

export default syncQueue;
