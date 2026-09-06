import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTotalLCSolved } from '../../utils/xpUtils';

export const RoadmapProgressSummary: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  
  const totalSolved = getTotalLCSolved({ userProfile, dailyLogs });
  const pct = Math.round((totalSolved / 360) * 100);

  return (
    <Card className="p-4 mb-6 border-border-accent/20 bg-gradient-to-r from-bgCard/70 to-bgCard/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1 w-full">
        <div className="flex justify-between items-center text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
          <span>Overall LeetCode Progress</span>
          <span className="font-mono text-accentBlue">{totalSolved}/360 Problems</span>
        </div>
        <ProgressBar value={pct} color="var(--accent-blue)" />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-3xl">🏆</div>
        <div>
          <span className="text-[10px] text-textMuted uppercase font-bold">Solving Stats</span>
          <span className="text-xs font-bold text-textPrimary block">{pct}% syllabus completed</span>
        </div>
      </div>
    </Card>
  );
};
