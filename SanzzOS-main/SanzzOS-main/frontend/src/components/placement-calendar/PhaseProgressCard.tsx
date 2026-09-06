import React, { useMemo } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay } from '../../utils/dateUtils';
import { getCompletionType } from '../../utils/placementCalendarUtils';
import { Card } from '../ui/Card';

interface PhaseDetail {
  id: number;
  name: string;
  range: string;
  startDay: number;
  endDay: number;
  milestone: string;
}

export const PLACEMENT_PHASES: PhaseDetail[] = [
  { id: 1, name: 'Foundation Lock', range: 'Days 1 – 31', startDay: 1, endDay: 31, milestone: 'Lock basic array algorithms + SkillRack core logic' },
  { id: 2, name: 'Coding Strength', range: 'Days 32 – 62', startDay: 32, endDay: 62, milestone: 'Master Strings, Hashing & recursion trees' },
  { id: 3, name: 'Placement Core', range: 'Days 63 – 92', startDay: 63, endDay: 92, milestone: 'Linear structures + advanced DBMS and SQL mastery' },
  { id: 4, name: 'Project + Interview Mode', range: 'Days 93 – 123', startDay: 93, endDay: 123, milestone: 'Refactor CareSync/SmartEdu portfolios + mock interviews' },
  { id: 5, name: 'Company-Specific Prep', range: 'Days 124 – 153', startDay: 124, endDay: 153, milestone: 'Target Zoho, Freshworks, Mu Sigma & PayPal prep tests' },
  { id: 6, name: 'Offer Mode', range: 'Days 154 – 184', startDay: 154, endDay: 184, milestone: 'Final revisions + live campus placement rounds' }
];

export const PhaseProgressCard: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const startDate = useCareerStore((s) => s.userProfile.startDate);
  const todayDay = useMemo(() => getTodayDay(startDate), [startDate]);

  const phaseStats = useMemo(() => {
    return PLACEMENT_PHASES.map((phase) => {
      let perfect = 0;
      let minimum = 0;
      let missed = 0;
      let freeze = 0;
      let partial = 0;

      const totalDaysInPhase = phase.endDay - phase.startDay + 1;
      let loggedCount = 0;

      for (let d = phase.startDay; d <= phase.endDay; d++) {
        if (d > todayDay) continue;
        const log = dailyLogs[d];
        const status = getCompletionType(log, d, todayDay);
        if (status === 'perfect') perfect++;
        else if (status === 'minimum') minimum++;
        else if (status === 'freeze') freeze++;
        else if (status === 'partial') partial++;
        else if (status === 'missed') missed++;
        
        if (log && log.status !== 'not_started') loggedCount++;
      }

      const totalCompleted = perfect + minimum + partial;
      const progressPercent = Math.round((totalCompleted / totalDaysInPhase) * 100);

      const isActive = todayDay >= phase.startDay && todayDay <= phase.endDay;
      const isPast = todayDay > phase.endDay;

      return {
        ...phase,
        perfect,
        minimum,
        missed,
        freeze,
        partial,
        progressPercent,
        isActive,
        isPast
      };
    });
  }, [dailyLogs, todayDay]);

  return (
    <Card className="p-5 border border-border-subtle bg-bgCard/40 flex flex-col gap-4 select-none">
      <div>
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Placement Phase Progress</h3>
        <p className="text-[10px] text-textMuted uppercase mt-1">Track key target completions across the 180-day milestone phases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phaseStats.map((phase) => (
          <div
            key={phase.id}
            className={`p-4 rounded-2xl border transition duration-200 flex flex-col justify-between ${
              phase.isActive
                ? 'bg-accentBlue/5 border-accentBlue/30 ring-1 ring-accentBlue/20 shadow-glow-blue/5'
                : phase.isPast
                ? 'bg-bgSurface/20 border-border-subtle/50 opacity-80'
                : 'bg-bgSurface/10 border-border-subtle/20 opacity-50'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">{phase.range}</span>
                {phase.isActive && (
                  <span className="text-[8px] font-extrabold uppercase bg-accentBlue/10 border border-accentBlue/25 px-1.5 py-0.5 rounded text-accentBlue">
                    Active Phase
                  </span>
                )}
              </div>
              <h4 className="font-bold text-textPrimary text-xs mt-1.5">{phase.name}</h4>
              <p className="text-[10px] text-textSecondary mt-1 leading-normal italic">"{phase.milestone}"</p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-textMuted">Progress</span>
                <span className="font-bold text-textPrimary">{phase.progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    phase.isActive ? 'bg-accentBlue' : 'bg-textMuted'
                  }`}
                  style={{ width: `${Math.min(phase.progressPercent, 100)}%` }}
                />
              </div>

              {/* Counts */}
              <div className="grid grid-cols-4 gap-1 text-center text-[8px] font-bold tracking-wider uppercase mt-1">
                <div className="p-1 bg-white/5 rounded">
                  <span className="block text-yellow-400 font-extrabold text-xs">{phase.perfect}</span>
                  <span className="text-[7px] text-textMuted">Perfect</span>
                </div>
                <div className="p-1 bg-white/5 rounded">
                  <span className="block text-emerald-400 font-extrabold text-xs">{phase.minimum}</span>
                  <span className="text-[7px] text-textMuted">Minimum</span>
                </div>
                <div className="p-1 bg-white/5 rounded">
                  <span className="block text-sky-400 font-extrabold text-xs">{phase.freeze}</span>
                  <span className="text-[7px] text-textMuted">Freeze</span>
                </div>
                <div className="p-1 bg-white/5 rounded">
                  <span className="block text-red-400 font-extrabold text-xs">{phase.missed}</span>
                  <span className="text-[7px] text-textMuted">Missed</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
