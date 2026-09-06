import React from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';

interface MonthlyCalendarProps {
  onDayClick: (day: number) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ onDayClick }) => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);

  // Mapped 180 cells (representing program days timeline layout)
  const cells = Array.from({ length: 180 }, (_, i) => i + 1);

  const getCellColorClass = (day: number) => {
    const log = dailyLogs[day];
    if (!log) return 'bg-border-subtle/10 hover:bg-border-subtle/30';
    if (log.status === 'completed') return 'bg-accentEmerald border border-accentEmerald/30 hover:shadow-glow-emerald';
    if (log.status === 'partial') return 'bg-accentOrange/60 border border-accentOrange/30 hover:bg-accentOrange';
    if (log.status === 'missed') return 'bg-red-500/20 border border-red-500/20 hover:bg-red-500/40';
    if (log.status === 'recovery') return 'bg-accentBlue/40 border border-accentBlue/20 hover:bg-accentBlue';
    return 'bg-border-subtle/10 hover:bg-border-subtle/30';
  };

  return (
    <Card className="flex flex-col select-none">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">Syllabus Completion Calendar</span>
          <span className="text-[10px] text-textMuted block mt-0.5">Click any logged cell day to inspect logs details</span>
        </div>
      </div>
      
      <div className="grid gap-2 pb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))' }}>
        {cells.map((day) => {
          return (
            <div
              key={day}
              onClick={() => onDayClick(day)}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold text-textSecondary transition cursor-pointer border border-border-subtle/50 ${getCellColorClass(day)}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 flex-wrap items-center mt-3 border-t border-border-subtle/50 pt-4 text-[9px] text-textMuted">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-border-subtle/10" />
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-accentOrange/60" />
          <span>Partial logs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-accentEmerald" />
          <span>Completed log</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-red-500/20" />
          <span>Missed log</span>
        </div>
      </div>
    </Card>
  );
};
