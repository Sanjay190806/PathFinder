import React from 'react';
import { PlacementDayPlan } from '../../data/placementCalendar';
import { PlacementDayCell } from './PlacementDayCell';
import { DayCompletionType } from '../../types/placementCalendar';
import { DailyLog } from '../../types';

interface PlacementMonthSectionProps {
  monthName: string;
  monthDays: PlacementDayPlan[];
  dailyLogs: Record<string, DailyLog>;
  todayDay: number;
  onDayClick: (day: PlacementDayPlan) => void;
  getCompletionType: (log: DailyLog | undefined, day: number, todayDay: number) => DayCompletionType;
}

export const PlacementMonthSection: React.FC<PlacementMonthSectionProps> = ({
  monthName,
  monthDays,
  dailyLogs,
  todayDay,
  onDayClick,
  getCompletionType
}) => {
  if (monthDays.length === 0) return null;

  const firstDayDate = new Date(monthDays[0].date);
  const startOffset = (firstDayDate.getDay() + 6) % 7; // Convert Sunday=0 to Sunday=6, Monday=1 to Monday=0

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="bg-bgCard/25 border border-border-subtle p-5 rounded-2xl flex flex-col gap-4 select-none">
      <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">{monthName}</h3>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center border-b border-border-subtle/50 pb-2">
        {daysOfWeek.map((day) => (
          <span key={day} className="text-[9px] font-extrabold text-textMuted tracking-widest">
            {day}
          </span>
        ))}
      </div>

      {/* Grid containing offset padding + cells */}
      <div className="grid grid-cols-7 gap-2">
        {/* Dummy placeholders for calendar offset */}
        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`offset-${index}`} className="bg-transparent border border-transparent min-h-[76px]" />
        ))}

        {/* Day Cells */}
        {monthDays.map((dayPlan) => {
          const log = dailyLogs[dayPlan.day];
          const completion = getCompletionType(log, dayPlan.day, todayDay);
          const isToday = dayPlan.day === todayDay;

          return (
            <PlacementDayCell
              key={dayPlan.day}
              dayPlan={dayPlan}
              completionType={completion}
              isToday={isToday}
              onClick={() => onDayClick(dayPlan)}
            />
          );
        })}
      </div>
    </div>
  );
};
