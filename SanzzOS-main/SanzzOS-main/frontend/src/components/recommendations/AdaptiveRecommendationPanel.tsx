import React from 'react';
import { useAdaptiveRecommendations } from '../../hooks/useAdaptiveRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { Sparkles } from 'lucide-react';

export const AdaptiveRecommendationPanel: React.FC = () => {
  const { recommendations } = useAdaptiveRecommendations();

  if (recommendations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 text-center select-none">
        <Sparkles className="h-5 w-5 text-accentBlue mx-auto opacity-40 mb-2" />
        <span className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">Not enough data</span>
        <p className="text-[9px] text-textMuted mt-1">Log real tasks, projects, resume checks, or applications to generate study targets.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accentBlue animate-pulse-glow" />
        <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Adaptive Study Targets</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
};
export default AdaptiveRecommendationPanel;
