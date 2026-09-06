import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemePreset, AnimationIntensity, PerformanceMode, ThemeSettings } from '../../types/theme';

interface ThemeSettingsState extends ThemeSettings {
  setPreset: (preset: ThemePreset) => void;
  setIntensity: (intensity: AnimationIntensity) => void;
  setPerformance: (performance: PerformanceMode) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
}

const getInitialReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

export const useThemeSettingsStore = create<ThemeSettingsState>()(
  persist(
    (set) => ({
      preset: 'classic',
      intensity: 'medium',
      performance: 'balanced',
      reducedMotion: getInitialReducedMotion(),
      
      setPreset: (preset) => set({ preset }),
      setIntensity: (intensity) => set({ intensity }),
      setPerformance: (performance) => set({ performance }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    {
      name: 'sanzz_os_theme_settings_v1',
    }
  )
);
