import React from 'react';
import { ThemePresetDetail } from '../../data/themePresets';

interface ThemePreviewCardProps {
  theme: ThemePresetDetail;
  active: boolean;
  onClick: () => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ theme, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-2xl border text-left p-4 transition-all duration-300 ${
        active 
          ? 'border-transparent bg-white/[0.04] ring-2' 
          : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
      }`}
      style={{
        borderColor: active ? theme.accentColor : undefined,
        boxShadow: active ? `0 0 20px ${theme.glowColor}` : undefined
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-textPrimary">{theme.name}</span>
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
            {theme.accentSecondary && (
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.accentSecondary }} />
            )}
          </div>
        </div>
        <p className="text-[10px] text-textSecondary leading-relaxed">{theme.description}</p>
        
        {/* Miniature HUD preview mockup */}
        <div className="mt-2 rounded-xl bg-black/60 border border-white/5 p-2 flex flex-col gap-1.5 relative overflow-hidden select-none pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.bgGradient} opacity-20`} />
          <div className="flex items-center justify-between z-10">
            <span className="h-2 w-12 rounded bg-white/20" />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden z-10">
            <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: theme.accentColor }} />
          </div>
        </div>
      </div>
    </button>
  );
};
