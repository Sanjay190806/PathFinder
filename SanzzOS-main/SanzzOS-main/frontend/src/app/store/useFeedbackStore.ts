import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeedbackType = 'bug' | 'feature' | 'idea' | 'issue';
export type FeedbackSeverity = 'low' | 'medium' | 'high';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  severity: FeedbackSeverity;
  page: string;
  createdAt: string;
  synced: boolean;
}

interface FeedbackState {
  feedback: FeedbackItem[];
  addFeedback: (item: Omit<FeedbackItem, 'id' | 'createdAt' | 'synced'>) => void;
  markSynced: (id: string) => void;
  clearFeedback: () => void;
}

const createId = () => `feedback-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set) => ({
      feedback: [],
      addFeedback: (item) => set((state) => ({
        feedback: [
          {
            ...item,
            id: createId(),
            createdAt: new Date().toISOString(),
            synced: false,
          },
          ...state.feedback,
        ].slice(0, 50),
      })),
      markSynced: (id) => set((state) => ({
        feedback: state.feedback.map((item) => (item.id === id ? { ...item, synced: true } : item)),
      })),
      clearFeedback: () => set({ feedback: [] }),
    }),
    {
      name: 'sanju-feedback-persist',
    }
  )
);

