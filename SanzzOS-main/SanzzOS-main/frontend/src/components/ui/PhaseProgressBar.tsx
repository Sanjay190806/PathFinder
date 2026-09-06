import React, { useMemo } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { Card } from './Card';
import { Badge } from './Badge';
import { getTodayDay } from '../../utils/dateUtils';

interface PhaseRange {
  name: string;
  start: number;
  end: number;
  dates: string;
  recommendation: string;
}

const PHASES: PhaseRange[] = [
  { name: 'Foundation Lock', start: 1, end: 45, dates: 'Days 1 – 45', recommendation: 'Focus on Java DSA Arrays/Strings & basic SkillRack problems.' },
  { name: 'Coding Strength', start: 46, end: 90, dates: 'Days 46 – 90', recommendation: 'Level up to sliding window, binary search, and stacks.' },
  { name: 'Placement Core', start: 91, end: 130, dates: 'Days 91 – 130', recommendation: 'Master DBMS SQL queries, Trees, Heaps, and CS Core subjects.' },
  { name: 'Project + Interview Mode', start: 131, end: 160, dates: 'Days 131 – 160', recommendation: 'Deliver CareSync AI / SmartEdu AI features and do mock interviews.' },
  { name: 'Company-Specific Prep', start: 161, end: 180, dates: 'Days 161 – 180', recommendation: 'Target Zoho, freshworks, and service company patterns.' },
  { name: 'Offer Mode', start: 181, end: 184, dates: 'Days 181 – 184', recommendation: 'Refine HR answers, polish GitHub/LinkedIn, and secure offers.' }
];

export const PhaseProgressBar: React.FC = () => {
  const { dailyLogs, userProfile } = useCareerStore();
  const todayDay = getTodayDay(userProfile.startDate);

  const phaseStats = useMemo(() => {
    return PHASES.map((phase) => {
      let completedDays = 0;
      let minDays = 0;
      let perfDays = 0;
      const total = phase.end - phase.start + 1;

      for (let d = phase.start; d <= phase.end; d++) {
        const log = dailyLogs[d];
        if (log) {
          if (log.status === 'completed' || log.completionType === 'minimum' || log.completionType === 'perfect') {
            completedDays++;
          }
          if (log.completionType === 'minimum') minDays++;
          if (log.completionType === 'perfect') perfDays++;
        }
      }

      const pct = Math.round((completedDays / total) * 100);
      const isCurrent = todayDay >= phase.start && todayDay <= phase.end;

      return {
        ...phase,
        completedDays,
        minDays,
        perfDays,
        total,
        pct,
        isCurrent
      };
    });
  }, [dailyLogs, todayDay]);

  return (
    <Card className="p-5 border-white/5 flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-textPrimary text-sm uppercase tracking-wider">Placement Phase Segments</h3>
        <p className="text-[10px] text-textMuted mt-0.5">Track your syllabus and readiness progression through segmented milestones.</p>
      </div>

      {/* Desktop Horizontal View */}
      <div className="hidden lg:flex items-stretch border border-border-subtle rounded-2xl overflow-hidden bg-bgSurface/20">
        {phaseStats.map((phase, idx) => (
          <div
            key={phase.name}
            className={`flex-1 p-3 border-r last:border-r-0 border-border-subtle flex flex-col justify-between transition ${
              phase.isCurrent ? 'bg-accentBlue/10 shadow-glow-blue' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start gap-1">
                <span className="text-[9px] font-black text-textMuted uppercase tracking-wider block">Phase {idx + 1}</span>
                {phase.isCurrent && <Badge variant="primary" className="text-[8px] py-0 px-1">Active</Badge>}
              </div>
              <h4 className="font-bold text-textPrimary text-xs mt-1 line-clamp-1">{phase.name}</h4>
              <span className="text-[9px] text-textSecondary mt-0.5 block">{phase.dates}</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                <span className="text-textMuted">{phase.pct}%</span>
                <span className="text-textSecondary">{phase.completedDays}/{phase.total} Days</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${phase.isCurrent ? 'bg-accentBlue' : 'bg-accentEmerald'}`}
                  style={{ width: `${phase.pct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Stacked View */}
      <div className="flex flex-col gap-3.5 lg:hidden">
        {phaseStats.map((phase, idx) => (
          <div
            key={phase.name}
            className={`p-4 rounded-xl border flex flex-col gap-2 transition ${
              phase.isCurrent ? 'border-accentBlue bg-accentBlue/5' : 'border-white/5 bg-white/[0.01]'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-textMuted uppercase tracking-wider block">Phase {idx + 1} — {phase.dates}</span>
                <h4 className="font-bold text-textPrimary text-sm mt-0.5">{phase.name}</h4>
              </div>
              <Badge variant={phase.isCurrent ? 'primary' : 'neutral'}>
                {phase.isCurrent ? 'Active' : `${phase.pct}% Done`}
              </Badge>
            </div>
            
            <p className="text-[10px] text-textSecondary leading-normal">
              <strong>Shayla Says:</strong> {phase.recommendation}
            </p>

            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-accentEmerald rounded-full"
                  style={{ width: `${phase.pct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-textPrimary whitespace-nowrap">{phase.completedDays} / {phase.total} Days</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
