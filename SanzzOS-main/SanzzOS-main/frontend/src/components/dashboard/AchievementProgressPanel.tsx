import React from 'react';
import { useAchievements } from '../../hooks/useAchievements';
import { Trophy, ChevronRight } from 'lucide-react';
import { navigateToPath } from '../../utils/navigation';

export const AchievementProgressPanel: React.FC = () => {
  const { achievements, stats, unlockedIds } = useAchievements();

  // Pick top 2 locked achievements closest to unlocking (highest percentage)
  const nearby = achievements
    .filter((a) => !unlockedIds.includes(a.id))
    .map((a) => {
      const percentage = (a.progressCurrent / a.progressTarget) * 100;
      return { ...a, percentage };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center pl-0.5">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accentOrange fill-current" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Badge Track</span>
        </div>
        <button
          type="button"
          onClick={() => navigateToPath('/achievements')}
          className="flex items-center gap-0.5 text-[8px] text-accentBlue font-bold hover:text-accentBlue/80 uppercase tracking-widest transition"
        >
          <span>All ({stats.unlocked}/{stats.total})</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {nearby.length === 0 ? (
          <div className="text-center py-4 text-[9px] text-textMuted uppercase font-bold">
            All achievements unlocked!
          </div>
        ) : (
          nearby.map((ach) => (
            <div key={ach.id} className="rounded-xl border border-white/5 bg-black/45 p-3 flex flex-col gap-2 relative overflow-hidden">
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-textPrimary leading-tight">{ach.title}</span>
                  <span className="text-[8px] text-textMuted uppercase mt-0.5">{ach.rarity} Badge</span>
                </div>
                <span className="text-[10px] font-bold text-accentOrange">+{ach.xpReward} XP</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[8px] font-black tracking-widest text-textMuted uppercase">
                  <span>PROGRESS</span>
                  <span>{ach.progressCurrent} / {ach.progressTarget}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-accentOrange rounded-full" style={{ width: `${ach.percentage}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default AchievementProgressPanel;
