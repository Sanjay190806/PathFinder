import React from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { navigateToPath } from '../../utils/navigation';

export const NoZeroDayRescueCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-accentOrange/30 bg-accentOrange/5 p-4 flex flex-col gap-3 relative overflow-hidden select-none">
      <div className="flex items-center gap-2 text-accentOrange">
        <Flame className="h-4.5 w-4.5 fill-current animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-wider">Streak Protection Active</span>
      </div>
      
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-black text-textPrimary">No Zero Days!</h4>
        <p className="text-[9px] text-textSecondary leading-relaxed">
          You haven't logged any progress today. Keep your daily streak alive by completing one 15-minute rescue revision task now.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigateToPath('/today')}
        className="flex items-center gap-1 text-[9px] font-black text-accentOrange hover:text-accentOrange/80 uppercase tracking-widest self-start mt-1 transition"
      >
        <span>Open Daily Planner</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
export default NoZeroDayRescueCard;
