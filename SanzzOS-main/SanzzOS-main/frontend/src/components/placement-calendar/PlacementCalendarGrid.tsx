import React from 'react';
import { PlacementDayPlan } from '../../data/placementCalendar';
import { PlacementMonthSection } from './PlacementMonthSection';
import { DayCompletionType } from '../../types/placementCalendar';
import { DailyLog } from '../../types';

interface PlacementCalendarGridProps {
  filteredDays: PlacementDayPlan[];
  dailyLogs: Record<string, DailyLog>;
  todayDay: number;
  onDayClick: (day: PlacementDayPlan) => void;
  getCompletionType: (log: DailyLog | undefined, day: number, todayDay: number) => DayCompletionType;
}

export const PlacementCalendarGrid: React.FC<PlacementCalendarGridProps> = ({
  filteredDays,
  dailyLogs,
  todayDay,
  onDayClick,
  getCompletionType
}) => {
  // Group days by Phase / Sprint block (30-day sprints)
  const blocksMap: Record<string, { name: string; days: PlacementDayPlan[] }> = {};

  filteredDays.forEach((day) => {
    const sprint = Math.ceil(day.day / 30);
    const blockKey = `sprint-${sprint}`;
    const startDay = (sprint - 1) * 30 + 1;
    const endDay = Math.min(sprint * 30, 184);

    if (!blocksMap[blockKey]) {
      blocksMap[blockKey] = {
        name: `Sprint ${sprint}: ${day.phase || 'Milestone Phase'} (Days ${startDay} – ${endDay})`,
        days: []
      };
    }
    blocksMap[blockKey].days.push(day);
  });

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      {Object.entries(blocksMap).map(([key, monthGroup]) => (
        <PlacementMonthSection
          key={key}
          monthName={monthGroup.name}
          monthDays={monthGroup.days}
          dailyLogs={dailyLogs}
          todayDay={todayDay}
          onDayClick={onDayClick}
          getCompletionType={getCompletionType}
        />
      ))}
      
      {filteredDays.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border-subtle rounded-2xl">
          <p className="text-sm font-bold text-textSecondary">No matching days found.</p>
          <p className="text-xs text-textMuted mt-1">Try resetting or loosening your filters.</p>
        </div>
      )}
    </div>
  );
};
