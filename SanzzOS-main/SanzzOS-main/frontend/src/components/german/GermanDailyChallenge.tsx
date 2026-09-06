import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { Sparkles, Flame, ShieldAlert } from 'lucide-react';

export const GermanDailyChallenge: React.FC = () => {
  const germanStreak = useCareerStore((s) => s.germanStreak || 0);
  const longestStreak = useCareerStore((s) => s.longestGermanStreak || 0);
  const germanXP = useCareerStore((s) => s.germanXP || 0);
  const repairStreak = useCareerStore((s) => s.repairStreak);

  const handleRepair = () => {
    if (germanXP >= 50) {
      repairStreak();
    }
  };

  return (
    <Card className="flex flex-col gap-4 border-accentYellow/20 bg-accentYellow/5">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-accentYellow" /> German Daily Challenge
        </span>
        <Badge variant="primary" className="bg-accentYellow/10 border-accentYellow/25 text-accentYellow flex items-center gap-1 font-bold">
          <Flame className="h-3.5 w-3.5 fill-current" /> {germanStreak} Days
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-textPrimary">Today's Study Goal:</h4>
        <p className="text-xs text-textSecondary leading-relaxed">
          Log at least <strong>15 minutes</strong> of German vocabulary training or complete 1 quiz to protect your streak.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-3 bg-bgSurface/20 border border-border-subtle rounded-xl text-xs font-mono">
        <div>
          <span className="text-[8px] text-textMuted block uppercase font-bold">Longest Streak</span>
          <span className="font-bold text-textPrimary">{longestStreak} days</span>
        </div>
        <div>
          <span className="text-[8px] text-textMuted block uppercase font-bold">Total German XP</span>
          <span className="font-bold text-accentEmerald">{germanXP} XP</span>
        </div>
      </div>

      {germanStreak === 0 && (
        <div className="mt-2 p-3 rounded-xl border border-accentOrange/20 bg-accentOrange/5 flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-accentOrange shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-textPrimary block">Streak Frozen / Lost</span>
              <p className="text-[10px] text-textMuted leading-relaxed">
                You didn't study yesterday. Spend 50 German XP to repair your streak and restore it to your maximum.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={germanXP < 50}
            onClick={handleRepair}
            className="text-[10px] h-[30px] border-accentOrange/30 text-accentOrange hover:bg-accentOrange/10 w-full"
          >
            🔧 Repair Streak (Costs 50 XP)
          </Button>
        </div>
      )}
    </Card>
  );
};
