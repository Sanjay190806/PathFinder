import React, { useEffect } from 'react';
import { useUIStore } from '../../app/store/useUIStore';

export const AchievementToast: React.FC = () => {
  const { activeBadge, setActiveBadge } = useUIStore();

  useEffect(() => {
    if (activeBadge) {
      const timer = setTimeout(() => {
        setActiveBadge(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeBadge, setActiveBadge]);

  if (!activeBadge) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-bgCard border-2 border-accentPurple/50 p-4 rounded-2xl flex items-center gap-4 shadow-glow-purple max-w-sm select-none">
      <span className="text-3xl">{activeBadge.emoji}</span>
      <div>
        <span className="text-[10px] text-accentPurple uppercase tracking-wider font-extrabold block">Badge Unlocked!</span>
        <span className="text-xs font-bold text-textPrimary block mt-0.5">{activeBadge.name}</span>
        <span className="text-[9px] text-textSecondary block mt-0.5">+200 XP Bonus rewarded!</span>
      </div>
      <button onClick={() => setActiveBadge(null)} className="text-textMuted hover:text-textPrimary ml-2">✕</button>
    </div>
  );
};
