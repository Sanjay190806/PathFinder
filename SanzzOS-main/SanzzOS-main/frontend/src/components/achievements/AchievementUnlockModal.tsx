import React, { useEffect, useState } from 'react';
import { Trophy, X, Award, Sparkles } from 'lucide-react';
import { ACHIEVEMENT_CATALOG } from '../../data/achievementCatalog';
import { Achievement } from '../../types/achievements';

interface AchievementUnlockModalProps {
  unlockedId: string | null;
  onClose: () => void;
  onClaim: (id: string) => void;
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  unlockedId,
  onClose,
  onClaim
}) => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (unlockedId) {
      const found = ACHIEVEMENT_CATALOG.find((a) => a.id === unlockedId);
      if (found) setAchievement(found);
    } else {
      setAchievement(null);
    }
  }, [unlockedId]);

  if (!unlockedId || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-br from-bgCard via-bgSurface to-black p-6 overflow-hidden text-center shadow-2xl flex flex-col items-center gap-4">
        {/* Glowing background flares */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-accentPrimary/10 filter blur-3xl" />
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-textSecondary hover:text-textPrimary transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="h-16 w-16 rounded-full bg-accentOrange/10 border border-accentOrange/30 flex items-center justify-center text-accentOrange shadow-glow-gold/15 mt-3">
          <Trophy className="h-8 w-8 animate-bounce" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center gap-1.5 text-accentBlue">
            <Sparkles className="h-4 w-4 fill-current animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Achievement Unlocked</span>
          </div>
          <h3 className="text-base font-black text-textPrimary tracking-tight mt-1">
            {achievement.title}
          </h3>
          <p className="text-[10px] text-textSecondary leading-normal max-w-xs mt-1">
            {achievement.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-accentOrange font-black text-sm bg-accentOrange/5 border border-accentOrange/15 px-3 py-1.5 rounded-xl">
          <Award className="h-4.5 w-4.5" />
          <span>+{achievement.xpReward} XP REWARD</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onClaim(achievement.id);
            onClose();
          }}
          className="w-full rounded-2xl bg-accentEmerald py-3 font-bold text-white hover:bg-accentEmerald/90 transition shadow-glow-emerald/10 mt-2"
        >
          Claim Reward & Close
        </button>
      </div>
    </div>
  );
};
export default AchievementUnlockModal;
