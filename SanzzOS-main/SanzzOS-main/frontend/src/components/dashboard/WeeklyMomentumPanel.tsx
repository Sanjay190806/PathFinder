import React from 'react';
import { CalendarCheck, Flame } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';

export const WeeklyMomentumPanel: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const currentDay = useUIStore((s) => s.currentDay);

  // Compute status for past 7 days
  const pastDays = Array.from({ length: 7 }).map((_, idx) => {
    const dayNum = currentDay - (6 - idx);
    const log = careerState.dailyLogs[dayNum];
    const completed = log?.status === 'completed' || log?.completionType === 'minimum' || log?.completionType === 'perfect';
    return {
      day: dayNum,
      active: dayNum > 0,
      completed,
      freeze: log?.freezeUsed
    };
  });

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center pl-0.5">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Weekly Consistency</span>
        </div>
        <div className="flex items-center gap-1 text-accentOrange text-[10px] font-bold">
          <Flame className="h-4 w-4 fill-current" />
          <span>Active Streak</span>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 mt-2">
        {pastDays.map((d, index) => {
          let colorClass = 'bg-white/5 border-white/5 text-textMuted';
          if (d.active) {
            if (d.completed) colorClass = 'bg-accentEmerald/15 border-accentEmerald/35 text-accentEmerald font-bold';
            else if (d.freeze) colorClass = 'bg-accentBlue/10 border-accentBlue/25 text-accentBlue font-bold';
            else colorClass = 'bg-black/45 border-white/5 text-textSecondary';
          }

          return (
            <div
              key={index}
              className={`flex-1 rounded-xl border py-3.5 text-center flex flex-col items-center gap-1 ${colorClass}`}
            >
              <span className="text-[8px] font-mono leading-none">DAY</span>
              <span className="text-xs font-black leading-none mt-0.5">{d.day > 0 ? d.day : '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default WeeklyMomentumPanel;
