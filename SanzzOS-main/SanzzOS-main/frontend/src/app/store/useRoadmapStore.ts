import { create } from 'zustand';

interface RoadmapStoreState {
  searchQuery: string;
  selectedTopic: string;
  selectedDifficulty: string;
  selectedStatus: 'all' | 'solved' | 'unsolved';
  
  setSearchQuery: (query: string) => void;
  setSelectedTopic: (topic: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setSelectedStatus: (status: 'all' | 'solved' | 'unsolved') => void;
}

export const useRoadmapStore = create<RoadmapStoreState>((set) => ({
  searchQuery: '',
  selectedTopic: '',
  selectedDifficulty: '',
  selectedStatus: 'all',
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
}));
