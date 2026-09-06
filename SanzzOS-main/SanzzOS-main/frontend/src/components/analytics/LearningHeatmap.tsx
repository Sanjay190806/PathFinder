import React from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay } from '../../utils/dateUtils';

export const LearningHeatmap: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs || {});
  const userProfile = useCareerStore((s) => s.userProfile || { startDate: '2026-07-01' });
  const todayDay = getTodayDay(userProfile.startDate);

  // Generate status details for all 180 days
  const days = Array.from({ length: 180 }, (_, i) => i + 1);

  const getDayDetails = (day: number) => {
    const log = dailyLogs[day];
    const isPast = day < todayDay;

    if (!log) {
      return {
        color: isPast ? 'bg-red-950/20 border-red-900/10' : 'bg-white/[0.02] border-white/5',
        label: `Day ${day}: No activity recorded ${isPast ? '(Missed)' : '(Future)'}`,
        tasksCount: 0
      };
    }

    if (log.freezeUsed) {
      return {
        color: 'bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]',
        label: `Day ${day}: Freeze Used ❄️ (${log.freezeReason || 'Rest day'})`,
        tasksCount: 0
      };
    }

    const counts = log.counts || {};
    const totalTasks = Object.values(counts).reduce((acc: number, val: any) => acc + (typeof val === 'number' ? val : 0), 0);

    if (log.completionType === 'perfect') {
      return {
        color: 'bg-yellow-500/35 border-yellow-400/60 shadow-[0_0_10px_rgba(234,179,8,0.3)]',
        label: `Day ${day}: PERFECT DAY! ⭐ (${totalTasks} tasks complete)`,
        tasksCount: totalTasks
      };
    }

    if (log.status === 'completed' || log.completionType === 'minimum') {
      return {
        color: 'bg-emerald-500/30 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
        label: `Day ${day}: Mission Complete ✅ (${totalTasks} tasks complete)`,
        tasksCount: totalTasks
      };
    }

    return {
      color: 'bg-red-950/40 border-red-500/30',
      label: `Day ${day}: Missed ❌`,
      tasksCount: 0
    };
  };

  return (
    <Card className="flex flex-col gap-4 relative overflow-hidden"
      style={{ border: '1px solid rgba(16,185,129,0.15)', background: 'rgba(5,15,8,0.8)' }}>
      {/* Watermark */}
      <div className="absolute top-0 right-0 text-[64px] opacity-[0.01] pointer-events-none select-none">📅</div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🍥</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
            180-Day Chronology Heatmap
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-white/40">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-white/[0.02] border border-white/5" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-950/40 border border-cyan-500/40" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/50" />
          <div className="w-2.5 h-2.5 rounded bg-yellow-500/35 border border-yellow-400/60" />
          <span>More</span>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] md:grid-cols-[repeat(30,minmax(0,1fr))] gap-2 select-none py-1">
        {days.map((day) => {
          const details = getDayDetails(day);

          return (
            <div
              key={day}
              className={`aspect-square rounded border transition-all duration-200 cursor-pointer relative group flex items-center justify-center ${details.color} hover:scale-115 hover:z-20`}
            >
              {/* Day inside square for high density viewing */}
              <span className="text-[8px] font-mono font-bold text-white/10 group-hover:text-white/80 pointer-events-none">
                {day}
              </span>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30">
                <div className="bg-black/95 text-white border border-white/10 px-2 py-1 rounded-lg text-[9px] font-bold font-mono whitespace-nowrap shadow-xl">
                  {details.label}
                </div>
                <div className="w-1.5 h-1.5 bg-black/95 border-r border-b border-white/10 rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
export default LearningHeatmap;
