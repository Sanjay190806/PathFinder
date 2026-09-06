import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComparisonResult {
  provider: string;
  model: string;
  content: string;
  latencyMs: number;
  tokenEstimate: number;
  costEstimate: number;
  error: string | null;
}

export interface ComparisonSession {
  id: string;
  prompt: string;
  timestamp: string;
  results: ComparisonResult[];
}

interface ComparisonState {
  history: ComparisonSession[];
  saveComparison: (prompt: string, results: ComparisonResult[]) => void;
  deleteComparison: (id: string) => void;
  clearHistory: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      history: [],
      saveComparison: (prompt, results) =>
        set((state) => ({
          history: [
            {
              id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              prompt,
              timestamp: new Date().toISOString(),
              results
            },
            ...state.history
          ]
        })),
      deleteComparison: (id) =>
        set((state) => ({
          history: state.history.filter((c) => c.id !== id)
        })),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'sanzz-comparison-store'
    }
  )
);
