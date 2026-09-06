import React from 'react';
import { PartyPopper, ArrowRight } from 'lucide-react';
import { navigateToPath } from '../../utils/navigation';

export const ComebackModeCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-accentEmerald/30 bg-accentEmerald/5 p-4 flex flex-col gap-3 relative overflow-hidden select-none">
      <div className="flex items-center gap-2 text-accentEmerald">
        <PartyPopper className="h-4.5 w-4.5" />
        <span className="text-[10px] font-black uppercase tracking-wider">Welcome Back, Champion</span>
      </div>
      
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-black text-textPrimary">The Journey Continues</h4>
        <p className="text-[9px] text-textSecondary leading-relaxed">
          Great to see you back in the training dojo. Let us ease in with a lightweight daily mission to re-align your momentum.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigateToPath('/today')}
        className="flex items-center gap-1 text-[9px] font-black text-accentEmerald hover:text-accentEmerald/80 uppercase tracking-widest self-start mt-1 transition"
      >
        <span>Start Comeback Mission</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
export default ComebackModeCard;
