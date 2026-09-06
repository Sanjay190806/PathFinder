import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useLearningOS } from '../../hooks/useLearningOS';
import { navigateToPath } from '../../utils/navigation';

export const WeakSkillFocusCard: React.FC = () => {
  const { state } = useLearningOS();

  // Find weakest learning path topic
  const weakest = state?.paths ? [...state.paths].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0] : null;

  if (!weakest || weakest.masteryPercentage >= 60) return null;

  return (
    <div className="rounded-2xl border border-accentRed/20 bg-white/[0.01] p-4 flex flex-col gap-3 relative overflow-hidden select-none hover:border-white/10 transition">
      <div className="flex items-center gap-2 text-accentRed">
        <ShieldAlert className="h-4.5 w-4.5" />
        <span className="text-[10px] font-black uppercase tracking-wider">Skill Deficit Detected</span>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-black text-textPrimary">Focus: {weakest.title}</h4>
        <p className="text-[9px] text-textSecondary leading-relaxed">
          Mastery rating is low at {weakest.masteryPercentage}%. Revise this topic inside your Learning OS directory.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigateToPath('/learning-os')}
        className="flex items-center gap-1 text-[9px] font-black text-accentRed hover:text-accentRed/80 uppercase tracking-widest self-start mt-1 transition"
      >
        <span>Open Learning OS</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
export default WeakSkillFocusCard;
