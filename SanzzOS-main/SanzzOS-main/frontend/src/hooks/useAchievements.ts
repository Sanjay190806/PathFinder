import { useState, useEffect, useMemo } from 'react';
import { ACHIEVEMENT_CATALOG } from '../data/achievementCatalog';
import { achievementService } from '../services/achievementService';
import { Achievement, AchievementState } from '../types/achievements';
import { useCareerStore } from '../app/store/useCareerStore';

export function useAchievements() {
  const [state, setState] = useState<AchievementState>(() => achievementService.getState());
  const awardXP = useCareerStore((s) => s.awardXP || (() => {}));

  useEffect(() => {
    const handleChanged = () => {
      setState(achievementService.getState());
    };
    window.addEventListener('achievements_changed', handleChanged);
    return () => window.removeEventListener('achievements_changed', handleChanged);
  }, []);

  const achievements = useMemo(() => {
    return ACHIEVEMENT_CATALOG.map((item) => {
      const currentProgress = state.progress[item.id] ?? 0;
      const isUnlocked = state.unlockedIds.includes(item.id);
      const isClaimed = state.claimedIds.includes(item.id);

      return {
        ...item,
        progressCurrent: currentProgress,
        unlockedAt: isUnlocked ? new Date().toISOString() : undefined,
        claimedAt: isClaimed ? new Date().toISOString() : undefined
      } as Achievement;
    });
  }, [state]);

  const stats = useMemo(() => {
    const total = achievements.length;
    const unlocked = achievements.filter((a) => state.unlockedIds.includes(a.id)).length;
    const completionPercent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    const rarityBreakdown = {
      common: achievements.filter((a) => a.rarity === 'common' && state.unlockedIds.includes(a.id)).length,
      uncommon: achievements.filter((a) => a.rarity === 'uncommon' && state.unlockedIds.includes(a.id)).length,
      rare: achievements.filter((a) => a.rarity === 'rare' && state.unlockedIds.includes(a.id)).length,
      epic: achievements.filter((a) => a.rarity === 'epic' && state.unlockedIds.includes(a.id)).length,
      legendary: achievements.filter((a) => a.rarity === 'legendary' && state.unlockedIds.includes(a.id)).length,
      mythic: achievements.filter((a) => a.rarity === 'mythic' && state.unlockedIds.includes(a.id)).length
    };

    return {
      total,
      unlocked,
      completionPercent,
      rarityBreakdown
    };
  }, [achievements, state.unlockedIds]);

  const claimReward = (id: string) => {
    const achievement = achievements.find((a) => a.id === id);
    if (!achievement) return;

    if (state.unlockedIds.includes(id) && !state.claimedIds.includes(id)) {
      const nextClaimed = [...state.claimedIds, id];
      const nextState = { ...state, claimedIds: nextClaimed };
      achievementService.saveState(nextState);
      
      // Award XP to player profile
      awardXP(achievement.xpReward);
    }
  };

  return {
    achievements,
    stats,
    claimReward,
    unlockedIds: state.unlockedIds,
    claimedIds: state.claimedIds
  };
}
export default useAchievements;
