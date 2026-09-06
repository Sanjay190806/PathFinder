import React from 'react';
import { AdaptiveRecommendation } from '../../services/adaptiveRecommendationService';
import { Target, Award, ArrowUpRight, Zap, Code2, GraduationCap, FilePlus2, Languages } from 'lucide-react';
import { navigateToPath } from '../../utils/navigation';

interface RecommendationCardProps {
  recommendation: AdaptiveRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getIcon = () => {
    switch (recommendation.category) {
      case 'dsa': return Target;
      case 'projects': return Code2;
      case 'german': return Languages;
      case 'resume': return FilePlus2;
      case 'sql': return Zap;
      default:
        return GraduationCap;
    }
  };

  const getPriorityColors = () => {
    switch (recommendation.priority) {
      case 'high': return 'text-accentOrange border-accentOrange/30 bg-accentOrange/5';
      case 'medium': return 'text-accentBlue border-accentBlue/30 bg-accentBlue/5';
      case 'low':
      default:
        return 'text-textSecondary border-white/10 bg-white/[0.02]';
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-3 relative overflow-hidden select-none hover:border-white/10 transition duration-200">
      <div className="flex items-center justify-between gap-3">
        <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${getPriorityColors()}`}>
          {recommendation.priority} Priority
        </span>
        <div className="flex items-center gap-1 text-accentOrange text-[10px] font-bold">
          <Award className="h-3.5 w-3.5" />
          <span>+{recommendation.xpReward} XP</span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-textSecondary shrink-0 mt-0.5">
          <IconComponent className="h-4.5 w-4.5 text-accentBlue" />
        </div>
        <div className="min-w-0 flex flex-col gap-0.5">
          <h4 className="text-xs font-bold text-textPrimary leading-snug">{recommendation.title}</h4>
          <p className="text-[9px] text-textSecondary leading-normal mt-0.5">{recommendation.reason}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-[9px] font-semibold text-textMuted uppercase tracking-wider">
        <span>⏱️ {recommendation.estimatedMinutes} MIN</span>
        <button
          type="button"
          onClick={() => navigateToPath(recommendation.linkedRoute)}
          className="flex items-center gap-1 text-[9px] font-black text-accentBlue hover:text-accentBlue/80 uppercase tracking-widest transition"
        >
          <span>{recommendation.actionLabel}</span>
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
export default RecommendationCard;
