import React from 'react';
import { AchievementRarity } from '../../types/achievements';

interface RarityBadgeProps {
  rarity: AchievementRarity;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity }) => {
  const getStyle = () => {
    switch (rarity) {
      case 'mythic':
        return 'text-red-400 border-red-500/30 bg-red-950/10 font-black animate-pulse-glow';
      case 'legendary':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/10 font-bold';
      case 'epic':
        return 'text-purple-400 border-purple-500/20 bg-purple-950/10';
      case 'rare':
        return 'text-blue-400 border-blue-500/20 bg-blue-950/10';
      case 'uncommon':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10';
      case 'common':
      default:
        return 'text-slate-400 border-white/10 bg-white/[0.02]';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[8px] uppercase tracking-wider font-extrabold ${getStyle()}`}>
      {rarity}
    </span>
  );
};
export default RarityBadge;
