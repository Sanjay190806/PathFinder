import { create } from 'zustand';

interface ApplicationStoreState {
  kanbanView: boolean;
  toggleView: () => void;
}

export const useApplicationStore = create<ApplicationStoreState>((set) => ({
  kanbanView: true,
  toggleView: () => set((state) => ({ kanbanView: !state.kanbanView })),
}));
