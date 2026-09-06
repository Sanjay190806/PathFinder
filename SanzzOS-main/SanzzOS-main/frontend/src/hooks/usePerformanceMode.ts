import { useState, useEffect } from 'react';

export type PerformanceMode = 'balanced' | 'lightweight' | 'full';

const KEY = 'sanzz_os_performance_settings_v1';

export function usePerformanceMode() {
  const [mode, setMode] = useState<PerformanceMode>(() => {
    return (localStorage.getItem(KEY) as PerformanceMode) || 'balanced';
  });

  useEffect(() => {
    const handleChanged = () => {
      setMode((localStorage.getItem(KEY) as PerformanceMode) || 'balanced');
    };
    window.addEventListener('performance_settings_changed', handleChanged);
    return () => window.removeEventListener('performance_settings_changed', handleChanged);
  }, []);

  const updateMode = (newMode: PerformanceMode) => {
    localStorage.setItem(KEY, newMode);
    window.dispatchEvent(new Event('performance_settings_changed'));
  };

  return {
    mode,
    updateMode,
    isLightweight: mode === 'lightweight'
  };
}
export default usePerformanceMode;
