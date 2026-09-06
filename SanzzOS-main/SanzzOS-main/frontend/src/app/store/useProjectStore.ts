import { create } from 'zustand';

interface ProjectStoreState {
  activeProjectKey: string | null;
  setActiveProjectKey: (key: string | null) => void;
}

export const useProjectStore = create<ProjectStoreState>((set) => ({
  activeProjectKey: null,
  setActiveProjectKey: (activeProjectKey) => set({ activeProjectKey }),
}));
