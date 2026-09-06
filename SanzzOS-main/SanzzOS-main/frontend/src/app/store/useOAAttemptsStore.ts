import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OAAttempt } from '../../types/companyIntelligence';
import { runMigrationForStore } from './migrations';

interface OAAttemptsState {
  attempts: OAAttempt[];
  addAttempt: (attempt: Omit<OAAttempt, 'id'>) => void;
  updateAttempt: (id: string, updates: Partial<OAAttempt>) => void;
  deleteAttempt: (id: string) => void;
}

export const useOAAttemptsStore = create<OAAttemptsState>()(
  persist(
    (set) => ({
      attempts: [
        {
          id: 'oa-1',
          companyName: 'Zoho',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
          platform: 'HackerRank',
          sections: ['Coding', 'Aptitude'],
          qCount: 5,
          solvedCount: 4,
          score: 80,
          difficulty: 'medium',
          mistakeLog: 'Struggled with matrix operations space constraints.',
          result: 'passed',
        },
      ],
      addAttempt: (a) =>
        set((state) => ({
          attempts: [
            {
              ...a,
              id: `oa-${Date.now()}`,
            },
            ...state.attempts,
          ],
        })),
      updateAttempt: (id, updates) =>
        set((state) => ({
          attempts: state.attempts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      deleteAttempt: (id) =>
        set((state) => ({
          attempts: state.attempts.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'sanzz_os_oa_attempts_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_oa_attempts_v1', persistedState, version),
    }
  )
);
