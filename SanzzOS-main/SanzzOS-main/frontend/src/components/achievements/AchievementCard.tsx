import React from 'react';
import { Achievement } from '../../types/achievements';
import { RarityBadge } from './RarityBadge';
import { Lock, CheckCircle2 } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  onClaim: () => void;
  unlocked: boolean;
  claimed: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onClaim,
  unlocked,
  claimed
}) => {
  const percent = Math.min(100, Math.round((achievement.progressCurrent / achievement.progressTarget) * 100));

  const getRarityGlow = () => {
    if (!unlocked) return 'border-white/5 bg-white/[0.01] opacity-55';
    
    switch (achievement.rarity) {
      case 'mythic': return 'border-red-500/20 bg-red-950/5 shadow-glow-red';
      case 'legendary': return 'border-amber-500/20 bg-amber-950/5 shadow-glow-gold';
      case 'epic': return 'border-purple-500/20 bg-purple-950/5';
      case 'rare': return 'border-blue-500/20 bg-blue-950/5';
      case 'uncommon': return 'border-emerald-500/20 bg-emerald-950/5';
      case 'common':
      default:
        return 'border-white/10 bg-white/[0.02]';
    }
  };

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 transition select-none ${getRarityGlow()}`}>
      <div className="flex items-center justify-between">
        <RarityBadge rarity={achievement.rarity} />
        
        {claimed ? (
          <span className="inline-flex items-center gap-1 text-accentEmerald text-[9px] font-black uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Claimed</span>
          </span>
        ) : unlocked ? (
          <button
            type="button"
            onClick={onClaim}
            className="rounded-lg bg-accentEmerald px-2.5 py-1 text-[9px] font-black text-white hover:bg-accentEmerald/90 transition uppercase tracking-wider shadow-glow-emerald/10"
          >
            Claim +{achievement.xpReward} XP
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-textMuted text-[9px] font-bold uppercase tracking-wider">
            <Lock className="h-3 w-3" />
            <span>Locked</span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h4 className={`text-xs font-bold text-textPrimary ${!unlocked ? 'opacity-85' : ''}`}>
          {achievement.title}
        </h4>
        <p className="text-[9px] text-textSecondary leading-normal">
          {achievement.description}
        </p>
      </div>

      {/* Progress tracker */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between text-[8px] font-black tracking-widest text-textMuted uppercase">
          <span>PROGRESS</span>
          <span>{achievement.progressCurrent} / {achievement.progressTarget}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300 bg-accentBlue" 
            style={{ 
              width: `${percent}%`,
              backgroundColor: unlocked ? 'var(--accent-primary)' : undefined
            }} 
          />
        </div>
      </div>
    </div>
  );
};
export default AchievementCard;
