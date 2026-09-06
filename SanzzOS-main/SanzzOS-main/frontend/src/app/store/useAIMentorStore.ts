import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MentorProfile, MentorInsight, MentorMission, MentorReview } from '../../types/aiMentor';
import { runMigrationForStore } from './migrations';

interface AIMentorState {
  profile: MentorProfile;
  insights: MentorInsight[];
  missions: MentorMission[];
  reviews: MentorReview[];
  
  updateProfile: (updates: Partial<MentorProfile>) => void;
  addMission: (mission: Omit<MentorMission, 'id' | 'completed'>) => void;
  toggleMission: (id: string) => void;
  addReview: (review: Omit<MentorReview, 'id' | 'savedAt'>) => void;
}

const DEFAULT_PROFILE: MentorProfile = {
  coachingTone: 'pragmatic',
  alertSensitivity: 'normal',
  nudgeFrequency: 'weekly',
  weeklyReviewDay: 0,
  monthlyReviewDay: 28,
};

const DEFAULT_INSIGHTS: MentorInsight[] = [
  {
    id: 'in-1',
    category: 'Consistency',
    title: 'Study consistency maintaining well',
    description: 'You hit your minimum daily rescue checkpoints. Keep it up!',
    ratingScore: 82,
    trend: 'improving',
  },
  {
    id: 'in-2',
    category: 'DSA',
    title: 'Averaging 2 DSA items per week',
    description: 'Aim for at least 4 items to match Zoho preparation guidelines.',
    ratingScore: 55,
    trend: 'stable',
  }
];

export const useAIMentorStore = create<AIMentorState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      insights: DEFAULT_INSIGHTS,
      missions: [
        {
          id: 'miss-1',
          title: 'Complete Zoho preparation sprint',
          description: 'Solve 10 Java DSA loops and SQL join queries.',
          xpReward: 300,
          completed: false,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        }
      ],
      reviews: [],

      updateProfile: (updates) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...updates,
          },
        })),

      addMission: (m) =>
        set((state) => ({
          missions: [
            ...state.missions,
            {
              ...m,
              id: `miss-${Date.now()}`,
              completed: false,
            },
          ],
        })),

      toggleMission: (id) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === id ? { ...m, completed: !m.completed } : m
          ),
        })),

      addReview: (r) =>
        set((state) => ({
          reviews: [
            {
              ...r,
              id: `rev-${Date.now()}`,
              savedAt: new Date().toISOString(),
            },
            ...state.reviews,
          ],
        })),
    }),
    {
      name: 'sanzz_os_ai_mentor_v3',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_ai_mentor_v3', persistedState, version),
    }
  )
);
