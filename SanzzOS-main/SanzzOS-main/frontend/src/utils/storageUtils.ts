import { CareerState } from '../types';

const STORAGE_KEY = 'sanju-career-os-v1';
const LEGACY_KEY_V3 = 'sanju-placement-v3';

export function save(state: CareerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Storage save failed:", e);
  }
}

export function load(): CareerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CareerState;
  } catch (e) {
    console.error("Storage load failed:", e);
    return null;
  }
}

export function clear(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function backup(state: CareerState): string {
  return JSON.stringify(state, null, 2);
}

export function restore(jsonStr: string): CareerState {
  const parsed = JSON.parse(jsonStr);
  if (validateBackup(parsed)) {
    return parsed as CareerState;
  }
  throw new Error("Invalid backup layout structure");
}

export function exportJSON(state: CareerState): void {
  const data = backup(state);
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sanju_career_os_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateBackup(parsed: any): parsed is CareerState {
  return (
    parsed &&
    typeof parsed === 'object' &&
    'userProfile' in parsed &&
    'dailyLogs' in parsed &&
    'projects' in parsed
  );
}

export function migrateOldVersion(): CareerState | null {
  try {
    const old = localStorage.getItem(LEGACY_KEY_V3);
    if (!old) return null;
    const d = JSON.parse(old);
    
    // Core migration logic
    const migrated: Partial<CareerState> = {
      userProfile: {
        name: d.userName || 'Sanju',
        startDate: '2026-07-01',
        totalDays: 180
      },
      dailyLogs: {},
      problemLogs: {},
      projects: {},
      resume: {
        version: '',
        atsScore: 0,
        lastUpdated: null,
        targetRole: '',
        sections: { contact: 0, education: 0, skills: 0, projects: 0, achievements: 0, formatting: 0 }
      },
      applications: [],
      xp: 0,
      level: 1,
      badges: [],
      unlockedBadges: {}
    };

    if (d.logs) {
      Object.keys(d.logs).forEach(day => {
        const l = d.logs[day];
        migrated.dailyLogs![day] = {
          counts: {
            leetcode: l.counts?.leetcode || 0,
            skillrack: l.counts?.skillrack || 0,
            aptitude: l.counts?.aptitude || 0,
            sql: l.counts?.sql || 0,
            cscore: l.counts?.cscore || 0,
            german: l.counts?.german || 0,
            project: l.counts?.project || 0,
            resume: l.counts?.resume || 0
          },
          lcStatus: d.lcStatus?.[day] || l.lcDone || [],
          note: l.note || '',
          mood: 3, energy: 3, distractions: 0, focusMinutes: 0,
          status: l.completed ? 'completed' : 'partial',
          savedAt: l.savedAt || new Date().toISOString(),
          xpEarned: 0
        };
      });
    }

    return migrated as CareerState;
  } catch(e) {
    console.warn("Migration failed:", e);
    return null;
  }
}
