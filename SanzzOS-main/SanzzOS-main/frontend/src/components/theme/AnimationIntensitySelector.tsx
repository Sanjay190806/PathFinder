import React from 'react';
import { useThemeSettingsStore } from '../../app/store/useThemeSettingsStore';
import { AnimationIntensity, PerformanceMode } from '../../types/theme';

export const AnimationIntensitySelector: React.FC = () => {
  const { 
    intensity, 
    setIntensity, 
    performance, 
    setPerformance, 
    reducedMotion, 
    setReducedMotion 
  } = useThemeSettingsStore();

  const intensities: { id: AnimationIntensity; label: string; desc: string }[] = [
    { id: 'off', label: 'Off', desc: 'No animations, zero particles' },
    { id: 'low', label: 'Low', desc: 'Subtle transitions only' },
    { id: 'medium', label: 'Balanced', desc: 'Smooth HUD sweeps & floaters' },
    { id: 'high', label: 'High Visuals', desc: 'Full sword-slashes & glows' }
  ];

  const modes: { id: PerformanceMode; label: string; desc: string }[] = [
    { id: 'lightweight', label: 'Battery Saver', desc: 'Optimize for low CPU usage' },
    { id: 'balanced', label: 'Balanced', desc: 'Standard visuals' },
    { id: 'full', label: 'Full Power', desc: 'Max FPS and detail quality' }
  ];

  return (
    <div className="flex flex-col gap-6 p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
      {/* 1. Visual Intensity */}
      <div className="flex flex-col gap-3">
        <div>
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Animation Intensity</h4>
          <p className="text-[10px] text-textSecondary mt-0.5">Control the speed and volume of active HUD effects.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {intensities.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIntensity(item.id)}
              className={`rounded-xl border p-3 text-center transition-all ${
                intensity === item.id 
                  ? 'border-accentBlue bg-accentBlue/10 text-textPrimary' 
                  : 'border-white/5 bg-black/20 text-textSecondary hover:bg-white/5'
              }`}
            >
              <span className="block text-xs font-bold">{item.label}</span>
              <span className="block text-[8px] opacity-70 mt-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Performance Mode */}
      <div className="flex flex-col gap-3">
        <div>
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Performance Profile</h4>
          <p className="text-[10px] text-textSecondary mt-0.5">Adjust resource allocation for background elements.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPerformance(item.id)}
              className={`rounded-xl border p-3 text-center transition-all ${
                performance === item.id 
                  ? 'border-accentEmerald bg-accentEmerald/10 text-textPrimary' 
                  : 'border-white/5 bg-black/20 text-textSecondary hover:bg-white/5'
              }`}
            >
              <span className="block text-xs font-bold">{item.label}</span>
              <span className="block text-[8px] opacity-70 mt-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Accessibility / Reduced Motion */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Reduced Motion</h4>
          <p className="text-[10px] text-textSecondary mt-0.5">Enforce system-wide standard static transition layouts.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accentBlue"></div>
        </label>
      </div>
    </div>
  );
};
