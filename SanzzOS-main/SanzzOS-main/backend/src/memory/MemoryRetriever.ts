import { MemoryItem, MemoryStore } from './MemoryStore.js';

export class MemoryRetriever {
  static getActiveMemories(category?: string): MemoryItem[] {
    const all = MemoryStore.getAll();
    // Exclude ignored (forgotten) memories
    let active = all.filter((m) => !m.ignored);
    
    if (category) {
      active = active.filter((m) => m.category === category);
    }
    
    return active;
  }

  static getForgottenMemories(): MemoryItem[] {
    return MemoryStore.getAll().filter((m) => m.ignored);
  }
}
