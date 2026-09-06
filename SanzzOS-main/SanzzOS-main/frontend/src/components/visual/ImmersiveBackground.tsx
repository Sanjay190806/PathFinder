import React from 'react';
import { useThemeSettingsStore } from '../../app/store/useThemeSettingsStore';
import { EnergyGrid } from './EnergyGrid';
import { ParticleField } from './ParticleField';
import { GlowOrb } from './GlowOrb';
import { SlashTrail } from './SlashTrail';

export const ImmersiveBackground: React.FC = () => {
  const { preset, intensity, performance, reducedMotion } = useThemeSettingsStore();

  // If animations are off or reduced motion is checked or preset is minimal, simplify
  const showEffects = intensity !== 'off' && !reducedMotion && preset !== 'minimal-focus';
  const showParticles = showEffects && performance !== 'lightweight';
  const showGrid = preset !== 'minimal-focus';
  const showSlashes = showEffects && preset === 'ember-blade' && performance === 'full';

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none bg-bgBase transition-colors duration-500">
      {/* 1. Base Gradient Glow Haze */}
      <div className="absolute inset-0 bg-gradient-to-br from-bgBase via-bgSurface to-black opacity-80" />
      
      {/* 2. Custom theme-specific glowing core orbs */}
      {showEffects && (
        <>
          <GlowOrb 
            color={preset === 'ember-blade' ? 'rgba(249, 115, 22, 0.08)' : preset === 'shadow-note' ? 'rgba(239, 68, 68, 0.05)' : preset === 'storm-shinobi' ? 'rgba(6, 182, 212, 0.1)' : preset === 'web-velocity' ? 'rgba(236, 72, 153, 0.08)' : 'rgba(59, 130, 246, 0.06)'} 
            size="w-[60vw] h-[60vw]" 
            position="top-[-10%] left-[-10%]"
          />
          <GlowOrb 
            color={preset === 'ember-blade' ? 'rgba(234, 179, 8, 0.06)' : preset === 'shadow-note' ? 'rgba(236, 72, 153, 0.03)' : preset === 'storm-shinobi' ? 'rgba(139, 92, 246, 0.08)' : preset === 'web-velocity' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)'} 
            size="w-[50vw] h-[50vw]" 
            position="bottom-[-10%] right-[-10%]"
          />
        </>
      )}

      {/* 3. Tech grid layer */}
      {showGrid && <EnergyGrid />}

      {/* 4. Drifting particles / sparks */}
      {showParticles && <ParticleField count={intensity === 'high' ? 24 : intensity === 'medium' ? 12 : 6} />}

      {/* 5. Shonen style sword-slash light trails */}
      {showSlashes && (
        <>
          <SlashTrail delay="0s" />
          <SlashTrail delay="4s" />
        </>
      )}
    </div>
  );
};
export default ImmersiveBackground;
