import React from 'react';
import { useAchievements } from '../../hooks/useAchievements';


export const AchievementProgressStrip: React.FC = () => {
  const { stats } = useAchievements();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full select-none">
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3.5 flex flex-col gap-1">
        <span className="text-[8px] text-textSecondary font-black uppercase tracking-widest">Unlocked Badges</span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xl font-black text-textPrimary">{stats.unlocked}</span>
          <span className="text-xs text-textMuted">/ {stats.total}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3.5 flex flex-col gap-1">
        <span className="text-[8px] text-textSecondary font-black uppercase tracking-widest">Completion rate</span>
        <span className="text-xl font-black text-textPrimary mt-0.5">{stats.completionPercent}%</span>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3.5 flex flex-col gap-1">
        <span className="text-[8px] text-textSecondary font-black uppercase tracking-widest">Mythic Badges</span>
        <span className="text-xl font-black text-red-400 mt-0.5">{stats.rarityBreakdown.mythic} Unlocked</span>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3.5 flex flex-col gap-1">
        <span className="text-[8px] text-textSecondary font-black uppercase tracking-widest">Epic Badges</span>
        <span className="text-xl font-black text-purple-400 mt-0.5">{stats.rarityBreakdown.epic} Unlocked</span>
      </div>
    </div>
  );
};
export default AchievementProgressStrip;
