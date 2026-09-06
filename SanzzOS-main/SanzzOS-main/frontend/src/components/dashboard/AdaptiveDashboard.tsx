import React from 'react';
import { TopCommandStrip } from './TopCommandStrip';
import { ReadinessHUD } from './ReadinessHUD';
import { TodayMissionPanel } from './TodayMissionPanel';
import { SkillProgressGrid } from './SkillProgressGrid';
import { AchievementProgressPanel } from './AchievementProgressPanel';
import { WeeklyMomentumPanel } from './WeeklyMomentumPanel';
import { ProjectResumePriorityPanel } from './ProjectResumePriorityPanel';
import { QuickActionDock } from './QuickActionDock';
import { CalendarDashboardWidget } from './CalendarDashboardWidget';
import { PortfolioMentorDashboardWidget } from './PortfolioMentorDashboardWidget';

import { useAdaptiveDashboard } from '../../hooks/useAdaptiveDashboard';
import { NoZeroDayRescueCard } from '../adaptive/NoZeroDayRescueCard';
import { ComebackModeCard } from '../adaptive/ComebackModeCard';
import { AlmostUnlockedCard } from '../adaptive/AlmostUnlockedCard';
import { WeakSkillFocusCard } from '../adaptive/WeakSkillFocusCard';
import { AdaptiveRecommendationPanel } from '../recommendations/AdaptiveRecommendationPanel';

export const AdaptiveDashboard: React.FC = () => {
  const { showNoZeroDay, showComeback } = useAdaptiveDashboard();

  return (
    <div className="flex flex-col gap-5 select-none pb-10">
      {/* 1. Tactical Command Welcome Strip */}
      <TopCommandStrip />

      {/* 2. Adaptive Warnings Haze Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {showComeback && <ComebackModeCard />}
        {showNoZeroDay && !showComeback && <NoZeroDayRescueCard />}
        <AlmostUnlockedCard />
        <WeakSkillFocusCard />
      </div>

      {/* 3. Placement readiness indicators HUD */}
      <ReadinessHUD />

      {/* 4. Adaptive Study Recommendations based on focus modes */}
      <AdaptiveRecommendationPanel />

      {/* 5. Split Main layout sections */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
        {/* Main interactive tracking Column */}
        <div className="flex flex-col gap-5">
          <TodayMissionPanel />
          <WeeklyMomentumPanel />
          <QuickActionDock />
        </div>

        {/* Informative Status / Statistics Column */}
        <div className="flex flex-col gap-5">
          <PortfolioMentorDashboardWidget />
          <CalendarDashboardWidget />
          <SkillProgressGrid />
          <ProjectResumePriorityPanel />
          <AchievementProgressPanel />
        </div>
      </div>
    </div>
  );
};
export default AdaptiveDashboard;
