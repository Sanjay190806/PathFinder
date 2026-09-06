import { ThemePreset } from '../types/theme';

export interface ThemePresetDetail {
  id: ThemePreset;
  name: string;
  description: string;
  accentColor: string;
  accentSecondary?: string;
  bgGradient: string;
  glowColor: string;
  styleClass: string;
}

export const THEME_PRESETS: ThemePresetDetail[] = [
  {
    id: 'classic',
    name: 'Classic Career OS',
    description: 'Clean default futuristic workspace styling with blue highlights.',
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-950/10 to-indigo-950/20',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    styleClass: 'classic'
  },
  {
    id: 'ember-blade',
    name: 'Ember Blade',
    description: 'Powerful sword-slash orange flame highlights with gold sparkles.',
    accentColor: '#F97316',
    accentSecondary: '#EAB308',
    bgGradient: 'from-orange-950/20 via-black to-red-950/10',
    glowColor: 'rgba(249, 115, 22, 0.2)',
    styleClass: 'ember-blade'
  },
  {
    id: 'shadow-note',
    name: 'Shadow Note',
    description: 'Dark ink and crimson shadows with minimalist gray text.',
    accentColor: '#EF4444',
    bgGradient: 'from-red-950/10 via-black to-slate-950/25',
    glowColor: 'rgba(239, 68, 68, 0.15)',
    styleClass: 'shadow-note'
  },
  {
    id: 'storm-shinobi',
    name: 'Storm Shinobi',
    description: 'Electric blue and lightning violet particles with energy rings.',
    accentColor: '#06B6D4',
    accentSecondary: '#8B5CF6',
    bgGradient: 'from-cyan-950/20 via-black to-purple-950/15',
    glowColor: 'rgba(6, 182, 212, 0.22)',
    styleClass: 'storm-shinobi'
  },
  {
    id: 'web-velocity',
    name: 'Web Velocity',
    description: 'Heroic deep midnight base with dynamic pink and speed blue line networks.',
    accentColor: '#EC4899',
    accentSecondary: '#3B82F6',
    bgGradient: 'from-pink-950/10 via-black to-blue-950/15',
    glowColor: 'rgba(236, 72, 153, 0.18)',
    styleClass: 'web-velocity'
  },
  {
    id: 'minimal-focus',
    name: 'Minimal Focus',
    description: 'Pure monochrome dashboard with zero distracting animations.',
    accentColor: '#94A3B8',
    bgGradient: 'from-slate-900 via-black to-slate-900',
    glowColor: 'rgba(255, 255, 255, 0.03)',
    styleClass: 'minimal-focus'
  }
];
