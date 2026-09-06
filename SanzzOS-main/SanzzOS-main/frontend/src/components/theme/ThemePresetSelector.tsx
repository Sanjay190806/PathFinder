import React from 'react';
import { THEME_PRESETS } from '../../data/themePresets';
import { ThemePreviewCard } from './ThemePreviewCard';
import { useThemeSettingsStore } from '../../app/store/useThemeSettingsStore';

export const ThemePresetSelector: React.FC = () => {
  const { preset, setPreset } = useThemeSettingsStore();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Visual Preset Themes</h4>
        <p className="text-[10px] text-textSecondary mt-0.5">Choose an anime-game styled command layout.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {THEME_PRESETS.map((item) => (
          <ThemePreviewCard
            key={item.id}
            theme={item}
            active={preset === item.id}
            onClick={() => setPreset(item.id)}
          />
        ))}
      </div>
    </div>
  );
};
export default ThemePresetSelector;
