import React, { useMemo } from 'react';
import { useThemeSettingsStore } from '../../app/store/useThemeSettingsStore';
import { usePerformanceMode } from '../../hooks/usePerformanceMode';

interface ParticleFieldProps {
  count: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ count }) => {
  const { preset } = useThemeSettingsStore();
  const { isLightweight } = usePerformanceMode();

  if (isLightweight) return null;

  const colorMap: Record<string, string> = {
    classic: 'bg-accentBlue/20',
    'ember-blade': 'bg-accentOrange/30',
    'shadow-note': 'bg-accentRed/20',
    'storm-shinobi': 'bg-accentCyan/30',
    'web-velocity': 'bg-accentPink/30',
    'minimal-focus': 'bg-white/5'
  };

  const particleColorClass = colorMap[preset] || colorMap.classic;

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 4 + 2; // 2px to 6px
      const left = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 15 + 10; // 10s to 25s
      const delay = Math.random() * -20; // negative delay to start immediately
      return { id: i, size, left, duration, delay };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full pointer-events-none animate-pulse-glow ${particleColorClass}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-20px',
            animation: `float-up ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-110vh) translateX(30px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
