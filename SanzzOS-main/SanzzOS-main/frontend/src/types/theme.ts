export type ThemePreset = 
  | 'classic'
  | 'ember-blade'
  | 'shadow-note'
  | 'storm-shinobi'
  | 'web-velocity'
  | 'minimal-focus';

export type AnimationIntensity = 'off' | 'low' | 'medium' | 'high';

export type PerformanceMode = 'lightweight' | 'balanced' | 'full';

export interface ThemeSettings {
  preset: ThemePreset;
  intensity: AnimationIntensity;
  performance: PerformanceMode;
  reducedMotion: boolean;
}
