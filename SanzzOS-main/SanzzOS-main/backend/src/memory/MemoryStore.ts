import fs from 'fs';
import path from 'path';

export interface MemoryItem {
  id: string;
  category: 'study' | 'german' | 'projects' | 'resume' | 'applications' | 'mood';
  content: string;
  pinned: boolean;
  ignored: boolean; // forgotten
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'memories.json');

export class MemoryStore {
  public static lastPromptSummary = 'No prompt composed yet.';

  private static initFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  static getAll(): MemoryItem[] {
    try {
      this.initFile();
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading memory store:', e);
      return [];
    }
  }

  static saveAll(memories: MemoryItem[]) {
    try {
      this.initFile();
      fs.writeFileSync(DATA_FILE, JSON.stringify(memories, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to memory store:', e);
    }
  }

  static getById(id: string): MemoryItem | undefined {
    return this.getAll().find((m) => m.id === id);
  }

  static add(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'pinned' | 'ignored'>): MemoryItem {
    const list = this.getAll();
    const newItem: MemoryItem = {
      ...item,
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      pinned: false,
      ignored: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newItem); // add to top
    this.saveAll(list);
    return newItem;
  }

  static update(id: string, updates: Partial<Pick<MemoryItem, 'pinned' | 'ignored' | 'content'>>): MemoryItem | null {
    const list = this.getAll();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const updated: MemoryItem = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    this.saveAll(list);
    return updated;
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length === list.length) return false;
    this.saveAll(filtered);
    return true;
  }

  static clear() {
    this.saveAll([]);
  }
}
