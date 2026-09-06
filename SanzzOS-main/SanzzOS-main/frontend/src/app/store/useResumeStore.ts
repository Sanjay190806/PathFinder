import { create } from 'zustand';
import { useCareerStore } from './useCareerStore';

interface ResumeStoreState {
  updateSectionScore: (key: string, val: number) => void;
}

export const useResumeStore = create<ResumeStoreState>(() => ({
  updateSectionScore: (key, val) => {
    const resume = useCareerStore.getState().resume;
    const sections = { ...resume.sections, [key]: val };
    useCareerStore.setState({
      resume: { ...resume, sections }
    });
  }
}));
