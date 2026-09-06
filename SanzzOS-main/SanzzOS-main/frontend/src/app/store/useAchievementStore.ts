import { create } from 'zustand';

interface AchievementStoreState {
  newBadgeUnlocked: string | null;
  clearNotification: () => void;
}

export const useAchievementStore = create<AchievementStoreState>((set) => ({
  newBadgeUnlocked: null,
  clearNotification: () => set({ newBadgeUnlocked: null }),
}));
