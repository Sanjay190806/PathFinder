import React from 'react';
import { PlacementDayPlan } from '../../data/placementCalendar';
import { DayCompletionType } from '../../types/placementCalendar';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getDateForDay } from '../../utils/dateUtils';

interface PlacementDayCellProps {
  dayPlan: PlacementDayPlan;
  completionType: DayCompletionType;
  isToday: boolean;
  onClick: () => void;
}

export const PlacementDayCell: React.FC<PlacementDayCellProps> = ({
  dayPlan,
  completionType,
  isToday,
  onClick
}) => {
  const getBgClass = () => {
    switch (completionType) {
      case 'perfect':
        return 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-yellow-500/40 text-yellow-200 hover:from-yellow-500/30 hover:to-yellow-600/40 shadow-glow-yellow/10';
      case 'minimum':
        return 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-500/40 text-emerald-200 hover:from-emerald-500/30 hover:to-emerald-600/40';
      case 'partial':
        return 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-200 hover:from-blue-500/20 hover:to-indigo-500/20';
      case 'freeze':
        return 'bg-gradient-to-br from-sky-500/20 to-sky-600/20 border-sky-500/40 text-sky-300 hover:from-sky-500/30 hover:to-sky-600/30 shadow-glow-blue/10';
      case 'missed':
        return 'bg-gradient-to-br from-red-500/10 to-red-600/15 border-red-500/30 text-red-300 hover:from-red-500/15 hover:to-red-600/20';
      case 'future':
      default:
        return 'bg-bgSurface/40 border-border-subtle/50 text-textSecondary hover:bg-bgSurface/60 hover:text-textPrimary';
    }
  };

  const startDate = useCareerStore((s) => s.userProfile?.startDate);
  const dayDate = getDateForDay(dayPlan.day, startDate);
  const dateNum = dayDate.getDate();

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start p-2.5 rounded-xl border text-left transition duration-200 w-full min-h-[76px] select-none ${getBgClass()} ${
        isToday ? 'ring-2 ring-accentBlue ring-offset-2 ring-offset-bgBase shadow-glow-blue/20' : ''
      }`}
    >
      <div className="flex justify-between items-center w-full">
        <span className="text-[10px] font-bold tracking-wider opacity-60">DAY {dayPlan.day}</span>
        <span className={`text-xs font-black ${isToday ? 'text-accentBlue' : ''}`}>{dateNum}</span>
      </div>
      
      <p className="mt-1 text-[10px] font-semibold line-clamp-2 leading-snug w-full group-hover:text-textPrimary transition">
        {dayPlan.title}
      </p>

      {dayPlan.leetcode && dayPlan.leetcode.length > 0 && (
        <div className="mt-auto pt-1 flex gap-1">
          <span className="text-[8px] px-1 py-0.5 rounded bg-white/5 font-mono opacity-80">
            {dayPlan.leetcode.length} LC
          </span>
        </div>
      )}
    </button>
  );
};
