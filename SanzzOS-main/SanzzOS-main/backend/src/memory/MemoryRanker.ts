import { MemoryItem } from './MemoryStore.js';

export class MemoryRanker {
  static rankAndLimit(memories: MemoryItem[], limit = 15): MemoryItem[] {
    // Sort pinned memories to the top
    const sorted = [...memories].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Secondary sort: chronological (latest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted.slice(0, limit);
  }
}
