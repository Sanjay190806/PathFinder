import React from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';

interface MissionCardProps {
  title: string;
  category: string;
  xpReward: number;
  completed: boolean;
  onToggle?: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  title,
  category,
  xpReward,
  completed,
  onToggle
}) => {
  return (
    <div
      onClick={onToggle}
      className={`group w-full rounded-xl border p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 select-none ${
        completed
          ? 'border-white/5 bg-white/[0.01] opacity-60'
          : 'border-white/10 bg-white/[0.03] hover:border-accentBlue/30 hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" className="text-textSecondary group-hover:text-accentBlue shrink-0 transition">
          {completed ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-accentEmerald" />
          ) : (
            <Circle className="h-4.5 w-4.5" />
          )}
        </button>
        <div className="min-w-0">
          <span className={`block text-xs font-semibold text-textPrimary truncate ${completed ? 'line-through' : ''}`}>
            {title}
          </span>
          <span className="block text-[8px] text-textMuted uppercase tracking-wider mt-0.5">{category}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 shrink-0">
        <Target className="h-3 w-3 text-accentOrange" />
        <span className="text-[10px] font-bold text-accentOrange">+{xpReward} XP</span>
      </div>
    </div>
  );
};
export default MissionCard;
