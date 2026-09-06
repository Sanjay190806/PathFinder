import { Shield } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { RankBadge } from '../ui/RankBadge';
import { XPProgressBar } from '../ui/XPProgressBar';

export const RankProgressPanel: React.FC = () => {
  const xp = useCareerStore((s) => s.xp);
  const level = useCareerStore((s) => s.level);
  
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/5 bg-white/[0.01] p-5 select-none relative overflow-hidden">
      {/* Sparkle decoration */}
      <div className="absolute top-[-20%] left-[-20%] h-32 w-32 rounded-full bg-accentPrimary/5 filter blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-accentPrimary" />
        <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Tactical Rank Progress</h3>
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-textMuted uppercase tracking-wider font-bold">Preparation Class</span>
          <span className="text-base font-black text-textPrimary mt-0.5">SWE Candidate</span>
        </div>
        <RankBadge xp={xp} />
      </div>

      <XPProgressBar currentXp={xp} level={level} />

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
          <span className="block text-[8px] text-textMuted uppercase font-bold">Total XP Earned</span>
          <span className="block text-sm font-black text-textPrimary mt-0.5">{xp} XP</span>
        </div>
        <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
          <span className="block text-[8px] text-textMuted uppercase font-bold">Next Milestone</span>
          <span className="block text-sm font-black text-textPrimary mt-0.5">
            {level * 500 - (xp - (level - 1) * level * 250)} XP Left
          </span>
        </div>
      </div>
    </div>
  );
};
export default RankProgressPanel;
