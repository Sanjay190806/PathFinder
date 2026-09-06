import React, { useMemo } from 'react';
import { useCalendarStore } from '../../app/store/useCalendarStore';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getDateForDay } from '../../utils/dateUtils';
import { navigateToPath } from '../../utils/navigation';
import { Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

export const CalendarDashboardWidget: React.FC = () => {
  const events = useCalendarStore((s) => s.events);
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const startDate = useCareerStore((s) => s.userProfile.startDate);

  const todayDateStr = useMemo(() => {
    const d = getDateForDay(selectedDay, startDate);
    return d.toISOString().substring(0, 10);
  }, [selectedDay, startDate]);

  // Filters events scheduled for today or next 2 days
  const upcomingEvents = useMemo(() => {
    const now = new Date(todayDateStr);
    const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days view

    return events
      .filter((evt) => {
        const evtDate = new Date(evt.start.substring(0, 10));
        return evtDate >= now && evtDate <= limit;
      })
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 4); // show at most 4 items
  }, [events, todayDateStr]);

  const urgentEvent = useMemo(() => {
    return upcomingEvents.find((e) => e.type === 'interview' || e.type === 'oa');
  }, [upcomingEvents]);

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0a0a1a]/55 p-4 flex flex-col gap-3.5 select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Calendar Preview</span>
        </div>
        <button
          onClick={() => navigateToPath('/calendar')}
          className="flex items-center gap-0.5 text-[9px] font-bold text-accentBlue hover:underline uppercase tracking-widest"
        >
          <span>Full OS</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {urgentEvent && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[10px] text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block">Urgent upcoming OA/Interview</span>
            <span className="text-textSecondary block mt-0.5">
              "{urgentEvent.title}" starts at {new Date(urgentEvent.start).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {upcomingEvents.length === 0 ? (
        <p className="text-[10px] text-textMuted text-center py-4">No events scheduled for the next 3 days.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {upcomingEvents.map((evt) => {
            const dateObj = new Date(evt.start);
            const isToday = evt.start.substring(0, 10) === todayDateStr;
            const dateLabel = isToday ? 'Today' : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={evt.id}
                onClick={() => navigateToPath('/calendar')}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-white/[0.02] bg-white/[0.01] hover:border-white/5 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: evt.color || '#3B82F6' }} />
                  <span className="text-[10px] font-bold text-textPrimary truncate">{evt.title}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[8px] text-textSecondary shrink-0">
                  {dateLabel} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CalendarDashboardWidget;
