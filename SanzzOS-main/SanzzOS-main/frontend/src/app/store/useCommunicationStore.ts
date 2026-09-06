import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SpeakingPracticeLog, InterviewMistake } from '../../types/mockInterview';
import { runMigrationForStore } from './migrations';

interface CommunicationState {
  logs: SpeakingPracticeLog[];
  mistakes: InterviewMistake[];
  addSpeakingLog: (log: Omit<SpeakingPracticeLog, 'id' | 'createdAt'>) => void;
  addMistake: (mistake: Omit<InterviewMistake, 'id' | 'occurrenceCount' | 'createdAt'>) => void;
  incrementMistake: (id: string) => void;
  resolveMistake: (id: string, resolutionPlan?: string) => void;
}

export const useCommunicationStore = create<CommunicationState>()(
  persist(
    (set) => ({
      logs: [],
      mistakes: [
        { id: 'm-1', category: 'Clarity', description: 'Speaking too fast when nervous', occurrenceCount: 3, resolved: false, createdAt: new Date().toISOString() },
        { id: 'm-2', category: 'Structure', description: 'Jumping directly to result without Situation context', occurrenceCount: 2, resolved: false, createdAt: new Date().toISOString() },
        { id: 'm-3', category: 'Conciseness', description: 'Using heavy filler words (like, sort of, basically)', occurrenceCount: 4, resolved: false, createdAt: new Date().toISOString() },
      ],
      addSpeakingLog: (log) =>
        set((state) => ({
          logs: [
            {
              ...log,
              id: `log-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.logs,
          ],
        })),
      addMistake: (m) =>
        set((state) => ({
          mistakes: [
            ...state.mistakes,
            {
              ...m,
              id: `mistake-${Date.now()}`,
              occurrenceCount: 1,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      incrementMistake: (id) =>
        set((state) => ({
          mistakes: state.mistakes.map((m) =>
            m.id === id ? { ...m, occurrenceCount: m.occurrenceCount + 1 } : m
          ),
        })),
      resolveMistake: (id, resolutionPlan) =>
        set((state) => ({
          mistakes: state.mistakes.map((m) =>
            m.id === id ? { ...m, resolved: true, resolutionPlan } : m
          ),
        })),
    }),
    {
      name: 'sanzz_os_communication_practice_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_communication_practice_v1', persistedState, version),
    }
  )
);
