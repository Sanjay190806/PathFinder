import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InterviewQuestion } from '../../types/mockInterview';
import { DEFAULT_INTERVIEW_QUESTIONS } from '../../data/defaultInterviewQuestions';
import { runMigrationForStore } from './migrations';

interface InterviewQuestionsState {
  questions: InterviewQuestion[];
  addQuestion: (question: Omit<InterviewQuestion, 'id'>) => void;
  updateQuestion: (id: string, question: Partial<InterviewQuestion>) => void;
  deleteQuestion: (id: string) => void;
  resetToDefaults: () => void;
}

export const useInterviewQuestionsStore = create<InterviewQuestionsState>()(
  persist(
    (set) => ({
      questions: DEFAULT_INTERVIEW_QUESTIONS,
      addQuestion: (q) =>
        set((state) => ({
          questions: [
            ...state.questions,
            { ...q, id: `custom-${Date.now()}`, isCustom: true },
          ],
        })),
      updateQuestion: (id, updates) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        })),
      deleteQuestion: (id) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        })),
      resetToDefaults: () =>
        set({
          questions: DEFAULT_INTERVIEW_QUESTIONS,
        }),
    }),
    {
      name: 'sanzz_os_interview_questions_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_interview_questions_v1', persistedState, version),
    }
  )
);
