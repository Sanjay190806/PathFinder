import React from 'react';
import { Trophy, ArrowRight } from 'lucide-react';
import { useAchievements } from '../../hooks/useAchievements';
import { navigateToPath } from '../../utils/navigation';

export const AlmostUnlockedCard: React.FC = () => {
  const { achievements, unlockedIds } = useAchievements();

  // Find achievements close to unlocking (e.g., >= 75% progress but not unlocked)
  const almostUnlocked = achievements.find((a) => {
    if (unlockedIds.includes(a.id)) return false;
    const percent = (a.progressCurrent / a.progressTarget) * 100;
    return percent >= 75;
  });

  if (!almostUnlocked) return null;

  return (
    <div className="rounded-2xl border border-accentBlue/20 bg-white/[0.01] p-4 flex flex-col gap-3 relative overflow-hidden select-none hover:border-white/10 transition">
      <div className="flex items-center gap-2 text-accentBlue">
        <Trophy className="h-4.5 w-4.5" />
        <span className="text-[10px] font-black uppercase tracking-wider">Milestone Nearby</span>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-black text-textPrimary">Chase: {almostUnlocked.title}</h4>
        <p className="text-[9px] text-textSecondary leading-relaxed">
          You are close to unlocking this badge. Progress: {almostUnlocked.progressCurrent} / {almostUnlocked.progressTarget}.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigateToPath('/achievements')}
        className="flex items-center gap-1 text-[9px] font-black text-accentBlue hover:text-accentBlue/80 uppercase tracking-widest self-start mt-1 transition"
      >
        <span>View Badge Details</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
export default AlmostUnlockedCard;
