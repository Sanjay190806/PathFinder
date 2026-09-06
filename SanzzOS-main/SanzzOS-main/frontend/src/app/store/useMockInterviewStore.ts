import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MockInterviewSession, InterviewAnswerDraft } from '../../types/mockInterview';
import { runMigrationForStore } from './migrations';

interface MockInterviewState {
  sessions: MockInterviewSession[];
  answers: Record<string, InterviewAnswerDraft>;
  projectPitches: Record<string, {
    pitch30s?: string;
    pitch60s?: string;
    pitch2m?: string;
    SweFocused?: string;
    AiFocused?: string;
    practicedCount: number;
    lastPracticedAt?: string;
  }>;
  addSession: (session: MockInterviewSession) => void;
  saveAnswerDraft: (questionId: string, draft: Partial<InterviewAnswerDraft>) => void;
  saveProjectPitch: (projectKey: string, pitch: Partial<{
    pitch30s: string;
    pitch60s: string;
    pitch2m: string;
    SweFocused: string;
    AiFocused: string;
  }>) => void;
  practicedProjectPitch: (projectKey: string) => void;
}

export const useMockInterviewStore = create<MockInterviewState>()(
  persist(
    (set) => ({
      sessions: [],
      answers: {},
      projectPitches: {
        caresync: { practicedCount: 0 },
        smartedu: { practicedCount: 0 },
        career_os: { practicedCount: 0 },
      },
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),
      saveAnswerDraft: (questionId, draft) =>
        set((state) => {
          const existing = state.answers[questionId] || {
            questionId,
            answerText: '',
            confidenceRating: 3,
            practicedCount: 0,
          };
          return {
            answers: {
              ...state.answers,
              [questionId]: {
                ...existing,
                ...draft,
                lastPracticedAt: draft.practicedCount && draft.practicedCount > existing.practicedCount
                  ? new Date().toISOString()
                  : existing.lastPracticedAt,
              } as InterviewAnswerDraft,
            },
          };
        }),
      saveProjectPitch: (projectKey, pitch) =>
        set((state) => {
          const existing = state.projectPitches[projectKey] || { practicedCount: 0 };
          return {
            projectPitches: {
              ...state.projectPitches,
              [projectKey]: {
                ...existing,
                ...pitch,
              },
            },
          };
        }),
      practicedProjectPitch: (projectKey) =>
        set((state) => {
          const existing = state.projectPitches[projectKey] || { practicedCount: 0 };
          return {
            projectPitches: {
              ...state.projectPitches,
              [projectKey]: {
                ...existing,
                practicedCount: existing.practicedCount + 1,
                lastPracticedAt: new Date().toISOString(),
              },
            },
          };
        }),
    }),
    {
      name: 'sanzz_os_mock_interview_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_mock_interview_v1', persistedState, version),
    }
  )
);
