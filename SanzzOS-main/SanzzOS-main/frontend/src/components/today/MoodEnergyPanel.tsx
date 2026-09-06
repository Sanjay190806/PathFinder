import React from 'react';
import { Card } from '../ui/Card';

interface MoodEnergyPanelProps {
  mood: number;
  energy: number;
  distractions: number;
  onMoodChange: (val: number) => void;
  onEnergyChange: (val: number) => void;
  onDistractionsChange: (val: number) => void;
}

export const MoodEnergyPanel: React.FC<MoodEnergyPanelProps> = ({
  mood,
  energy,
  distractions,
  onMoodChange,
  onEnergyChange,
  onDistractionsChange
}) => {
  const emojis = ['😴', '😐', '🙂', '😊', '🔥'];

  return (
    <Card className="flex flex-col gap-4">
      {/* Mood Selector */}
      <div>
        <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block mb-2 pl-0.5">Mood Rating</label>
        <div className="flex gap-2">
          {emojis.map((emoji, index) => {
            const val = index + 1;
            const isSelected = mood === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onMoodChange(val)}
                className={`flex-1 py-1.5 rounded-lg border text-base transition ${
                  isSelected
                    ? 'bg-accentPurple/20 border-accentPurple text-textPrimary'
                    : 'bg-bgSurface border-border-subtle hover:bg-bg-glass-hover text-textSecondary'
                }`}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Level Selector */}
      <div>
        <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block mb-2 pl-0.5">Energy Level (1-5)</label>
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((val) => {
            const isActive = energy >= val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onEnergyChange(val)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                  isActive
                    ? 'bg-accentBlue border-accentBlue text-white'
                    : 'bg-bgSurface border-border-subtle text-textSecondary'
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distractions Counter */}
      <div className="flex justify-between items-center mt-1 border-t border-border-subtle/50 pt-3">
        <div>
          <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block pl-0.5">Distractions count</span>
          <span className="text-xs text-textMuted block pl-0.5">Urges or notification checks</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onDistractionsChange(Math.max(distractions - 1, 0))}
            className="w-7 h-7 flex items-center justify-center bg-bgSurface border border-border-subtle rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bg-glass-hover transition font-bold"
          >
            -
          </button>
          <span className="text-sm font-extrabold text-textPrimary font-mono w-6 text-center">{distractions}</span>
          <button
            onClick={() => onDistractionsChange(distractions + 1)}
            className="w-7 h-7 flex items-center justify-center bg-bgSurface border border-border-subtle rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bg-glass-hover transition font-bold"
          >
            +
          </button>
        </div>
      </div>
    </Card>
  );
};
