import { useEffect } from 'react';
import { useThemeSettingsStore } from '../app/store/useThemeSettingsStore';

export function useThemePreset() {
  const { preset, intensity, performance, reducedMotion } = useThemeSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Inject Preset Theme variable mapping
    root.setAttribute('data-theme', preset);
    
    // 2. Set intensity classes
    root.classList.remove('intensity-off', 'intensity-low', 'intensity-medium', 'intensity-high');
    root.classList.add(`intensity-${intensity}`);
    
    // 3. Set performance classes
    root.classList.remove('perf-lightweight', 'perf-balanced', 'perf-full');
    root.classList.add(`perf-${performance}`);
    
    // 4. Set reduced motion class
    if (reducedMotion || intensity === 'off') {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [preset, intensity, performance, reducedMotion]);
}
