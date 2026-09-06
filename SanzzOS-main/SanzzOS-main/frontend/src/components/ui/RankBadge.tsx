import { Shield } from 'lucide-react';

interface RankBadgeProps {
  xp: number;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ xp }) => {
  const getRankInfo = (totalXp: number) => {
    if (totalXp >= 10000) return { title: 'Offer Ready', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    if (totalXp >= 7500) return { title: 'Elite Operator', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
    if (totalXp >= 5000) return { title: 'Lead Architect', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
    if (totalXp >= 3000) return { title: 'Code Strategist', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
    if (totalXp >= 1500) return { title: 'System Analyst', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' };
    if (totalXp >= 600) return { title: 'Builder', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
    if (totalXp >= 200) return { title: 'Trainee', color: 'text-slate-300 bg-slate-300/10 border-slate-300/30' };
    return { title: 'Rookie', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
  };

  const rank = getRankInfo(xp);

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-bold tracking-wider uppercase select-none ${rank.color}`}>
      <Shield className="h-3 w-3 shrink-0" />
      <span>{rank.title}</span>
    </div>
  );
};
export default RankBadge;
