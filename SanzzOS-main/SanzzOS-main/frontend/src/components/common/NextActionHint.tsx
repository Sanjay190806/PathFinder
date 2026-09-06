import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NextActionHintProps {
  hint: string;
  onClick?: () => void;
}

export const NextActionHint: React.FC<NextActionHintProps> = ({ hint, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-2 p-2 rounded-xl border border-white/5 bg-white/[0.01] text-[10px] text-textSecondary leading-normal ${
        onClick ? 'cursor-pointer hover:border-accentBlue/30 hover:bg-white/[0.03] transition' : ''
      }`}
    >
      <Sparkles className="h-3.5 w-3.5 text-accentBlue shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="font-semibold text-textPrimary">Next:</span> {hint}
      </div>
      {onClick && <ArrowRight className="h-3 w-3 text-textMuted shrink-0 mt-0.5" />}
    </div>
  );
};
export default NextActionHint;
