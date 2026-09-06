import { create } from 'zustand';
import { useCareerStore } from './useCareerStore';

interface SettingsStoreState {
  updateProfile: (name: string, startDate: string) => void;
}

export const useSettingsStore = create<SettingsStoreState>(() => ({
  updateProfile: (name, startDate) => {
    const profile = useCareerStore.getState().userProfile;
    useCareerStore.setState({
      userProfile: { ...profile, name, startDate }
    });
  }
}));
