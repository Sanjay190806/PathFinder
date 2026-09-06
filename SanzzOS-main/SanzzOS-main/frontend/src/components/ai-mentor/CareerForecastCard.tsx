import React from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { TrendingUp } from 'lucide-react';
import { getStreak } from '../../utils/xpUtils';

export const CareerForecastCard: React.FC = () => {
  const careerState = useCareerStore.getState();
  const { readiness: portReadiness } = usePortfolioOS();

  const getForecast = (category: string) => {
    if (category === 'Placement Readiness') {
      const placementXP = careerState.xp || 0;
      return { status: placementXP >= 1500 ? 'Improving' : 'Stable', color: 'text-accentEmerald bg-accentEmerald/10 border-accentEmerald/20' };
    }
    if (category === 'Portfolio Readiness') {
      return { status: portReadiness.overall >= 70 ? 'Improving' : portReadiness.overall >= 40 ? 'Stable' : 'Declining', color: portReadiness.overall >= 70 ? 'text-accentEmerald bg-accentEmerald/10 border-accentEmerald/20' : 'text-accentOrange bg-accentOrange/10 border-accentOrange/20' };
    }
    // Consistency logs check
    const streak = getStreak(careerState);
    return { status: streak >= 3 ? 'Improving' : 'Declining', color: streak >= 3 ? 'text-accentEmerald bg-accentEmerald/10 border-accentEmerald/20' : 'text-red-400 bg-red-400/10 border-red-400/20' };
  };

  const CATEGORIES = ['Placement Readiness', 'Portfolio Readiness', 'Study Consistency'] as const;

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Rule-Based Career Forecasts</span>
        </div>
        <span className="text-[8px] text-textMuted font-semibold italic">* Based on local KPI logs</span>
      </div>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((cat) => {
          const forecast = getForecast(cat);
          return (
            <div key={cat} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01]">
              <span className="font-semibold text-textSecondary">{cat}</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${forecast.color}`}>
                {forecast.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CareerForecastCard;
