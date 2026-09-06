import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { progressionService } from '../../services/progressionService';
import { XPProgressBar } from '../ui/XPProgressBar';

export const RankProgressCard: React.FC = () => {
  const xp = useCareerStore((s) => s.xp);
  const level = useCareerStore((s) => s.level);
  
  const rank = progressionService.getRankForLevel(level);

  return (
    <div className={`rounded-2xl border p-4.5 flex flex-col gap-4 relative overflow-hidden select-none ${rank.colorClass}`}>
      {/* Background decoration orb */}
      <div className="absolute top-[-20%] right-[-20%] h-28 w-28 rounded-full bg-white/5 filter blur-xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4.5 w-4.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">SWE / Analyst Rank Status</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse-glow" />
          <span className="text-[10px] font-black uppercase tracking-wider">{rank.tier}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
        <span className="text-xl font-black text-textPrimary tracking-tight">Level {level}</span>
        <p className="text-[10px] text-textSecondary leading-normal mt-0.5">{rank.description}</p>
      </div>

      <XPProgressBar currentXp={xp} level={level} />

      <div className="flex justify-between items-center text-[9px] text-textMuted uppercase font-bold mt-1">
        <span>Accumulated XP</span>
        <span className="font-mono text-textPrimary">{xp} XP Total</span>
      </div>
    </div>
  );
};
export default RankProgressCard;
