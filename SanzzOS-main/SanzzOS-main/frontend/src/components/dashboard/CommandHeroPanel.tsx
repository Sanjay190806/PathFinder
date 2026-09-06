import { Sparkles, Flame } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getStreak } from '../../utils/xpUtils';

interface CommandHeroPanelProps {
  recommendedAction?: string;
  readinessScore?: number;
}

export const CommandHeroPanel: React.FC<CommandHeroPanelProps> = ({ 
  recommendedAction = 'Solve today\'s daily LeetCode challenge to protect your streak.',
  readinessScore = 0
}) => {
  const careerState = useCareerStore((s) => s);
  const name = careerState.userProfile.name;
  const streak = getStreak(careerState);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="relative rounded-3xl border border-white/5 bg-gradient-to-r from-bgCard to-black/60 p-6 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-accentPrimary/5 filter blur-3xl pointer-events-none" />
      
      <div className="flex flex-col gap-2 z-10 max-w-xl">
        <div className="flex items-center gap-2 text-accentPrimary">
          <Sparkles className="h-4 w-4 fill-current animate-pulse-glow" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tactical Career OS</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-textPrimary tracking-tight">
          {getGreeting()}, <span className="text-accentPrimary">{name || 'Local user'}</span>
        </h2>
        <p className="text-xs text-textSecondary leading-relaxed mt-1">
          {recommendedAction}
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0 z-10 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-accentOrange text-lg font-black">
            <Flame className="h-5 w-5 fill-current" />
            <span>{streak}</span>
          </div>
          <span className="text-[8px] text-textMuted uppercase tracking-wider font-bold mt-0.5">Daily Streak</span>
        </div>
        
        <div className="h-8 w-[1px] bg-white/10" />

        <div className="flex flex-col items-center">
          <span className="text-textPrimary text-lg font-black">{readinessScore}%</span>
          <span className="text-[8px] text-textMuted uppercase tracking-wider font-bold mt-0.5">Readiness</span>
        </div>
      </div>
    </div>
  );
};
export default CommandHeroPanel;
