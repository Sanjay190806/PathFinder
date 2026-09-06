import React from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';
import { useCareerStore } from '../../app/store/useCareerStore';
import { LevelRing } from '../progression/LevelRing';
import { UserModeBadge } from '../personalization/UserModeBadge';
import { Compass } from 'lucide-react';

import { getAnimeRankInfo } from '../../utils/animeLevelUtils';

export const TopCommandStrip: React.FC = () => {
  const { profile } = usePersonalization();
  const xp = useCareerStore((s) => s.xp);
  const level = useCareerStore((s) => s.level);

  const anime = getAnimeRankInfo(level);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl border border-white/5 bg-gradient-to-r from-bgCard to-black/35 select-none relative overflow-hidden">
      {/* Abstract light flare background */}
      <div className="absolute top-[-10%] right-[-10%] h-36 w-36 rounded-full bg-accentPrimary/5 filter blur-2xl pointer-events-none" />

      <div className="flex items-center gap-4 z-10">
        <LevelRing currentXp={xp} level={level} size={48} strokeWidth={3.5} />
        <div className="flex flex-col">
          <span className="text-[10px] text-textMuted font-black uppercase tracking-widest">{getGreeting()}</span>
          <h2 className="text-lg font-black text-textPrimary tracking-tight mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-accentPrimary">{profile.name || 'Local user'}</span>
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-white/5 bg-white/5" style={{ color: anime.narutoColor }}>
              {anime.narutoRank}
            </span>
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-white/5 bg-white/5" style={{ color: anime.demonSlayerColor }}>
              {anime.demonSlayerBreathing}
            </span>
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-5 z-10">
        <UserModeBadge />

        <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2">
          <Compass className="h-4.5 w-4.5 text-accentBlue" />
          <div className="flex flex-col">
            <span className="text-[8px] text-textMuted uppercase font-bold tracking-wider">TARGET PATH</span>
            <span className="text-xs font-black text-textPrimary uppercase">
              {profile.careerMode.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TopCommandStrip;
