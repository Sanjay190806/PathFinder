import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BenchmarkScore {
  received: number;
  format: number;
  ruleAdherence: number;
  latency: number;
  total: number;
}

export interface BenchmarkResultItem {
  category: string;
  success: boolean;
  content: string;
  latencyMs: number;
  tokenEstimate: number;
  costEstimate: number;
  scores: BenchmarkScore;
  error: string | null;
  userRating?: number; // 1 to 5 stars
}

export interface BenchmarkSession {
  id: string;
  provider: string;
  model: string;
  timestamp: string;
  results: BenchmarkResultItem[];
  overallScore: number;
}

interface BenchmarkState {
  history: BenchmarkSession[];
  saveSession: (provider: string, model: string, results: BenchmarkResultItem[]) => void;
  rateCategory: (sessionId: string, category: string, rating: number) => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
}

export const useBenchmarkStore = create<BenchmarkState>()(
  persist(
    (set) => ({
      history: [],
      saveSession: (provider, model, results) =>
        set((state) => {
          const totalPoints = results.reduce((sum, r) => sum + r.scores.total, 0);
          const maxPoints = results.length * 80; // 80 points maximum per test
          // Normalize score out of 100
          const overallScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

          return {
            history: [
              {
                id: `bench-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                provider,
                model,
                timestamp: new Date().toISOString(),
                results,
                overallScore
              },
              ...state.history
            ]
          };
        }),
      rateCategory: (sessionId, category, rating) =>
        set((state) => ({
          history: state.history.map((s) => {
            if (s.id !== sessionId) return s;
            const nextResults = s.results.map((r) => {
              if (r.category !== category) return r;
              // Recalculate total score including user rating (0 to 20 points: rating * 4)
              const userRatingPoints = rating * 4;
              const originalTotal = r.scores.received + r.scores.format + r.scores.ruleAdherence + r.scores.latency;
              const nextTotal = originalTotal + userRatingPoints;

              return {
                ...r,
                userRating: rating,
                scores: {
                  ...r.scores,
                  total: Math.min(nextTotal, 100)
                }
              };
            });
            
            // Recompute overall session score
            const nextTotalPoints = nextResults.reduce((sum, r) => sum + r.scores.total, 0);
            const nextMaxPoints = nextResults.length * 100; // Now max is 100 including user rating
            const nextOverallScore = nextMaxPoints > 0 ? Math.round((nextTotalPoints / nextMaxPoints) * 100) : 0;

            return {
              ...s,
              results: nextResults,
              overallScore: nextOverallScore
            };
          })
        })),
      deleteSession: (id) =>
        set((state) => ({
          history: state.history.filter((s) => s.id !== id)
        })),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'sanzz-benchmark-store'
    }
  )
);
