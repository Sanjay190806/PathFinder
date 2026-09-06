import React, { useState } from 'react';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getDateForDay, formatDate, getTodayDay } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_CONFIG: Record<string, { glow: string; border: string; bg: string; emoji: string }> = {
  completed:    { glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',  border: 'border-emerald-500/60', bg: 'bg-emerald-950/40', emoji: '✅' },
  perfect:      { glow: 'shadow-[0_0_16px_rgba(234,179,8,0.45)]',  border: 'border-yellow-400/60',  bg: 'bg-yellow-950/40',  emoji: '⭐' },
  minimum:      { glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',  border: 'border-emerald-600/40', bg: 'bg-emerald-950/30', emoji: '✅' },
  missed:       { glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',   border: 'border-red-700/40',     bg: 'bg-red-950/30',     emoji: '❌' },
  freeze_used:  { glow: 'shadow-[0_0_12px_rgba(6,182,212,0.35)]',  border: 'border-cyan-500/40',    bg: 'bg-cyan-950/30',    emoji: '❄️' },
  not_started:  { glow: '',                                          border: 'border-white/8',        bg: 'bg-white/[0.02]',   emoji: ''   },
};

const WINDOW = 7; // days visible at once

export const WeekStrip: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const setSelectedDay = useDailyLogStore((s) => s.setSelectedDay);
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const todayDay = getTodayDay(userProfile.startDate);

  // windowStart = first day visible in the strip
  const [windowStart, setWindowStart] = useState(() => Math.max(1, selectedDay - 3));

  const canGoBack = windowStart > 1;
  const canGoForward = windowStart + WINDOW - 1 < 180;

  const goBack = () => {
    const next = Math.max(1, windowStart - WINDOW);
    setWindowStart(next);
  };

  const goForward = () => {
    const next = Math.min(181 - WINDOW, windowStart + WINDOW);
    setWindowStart(next);
  };

  const jumpToToday = () => {
    const start = Math.max(1, todayDay - 3);
    setWindowStart(start);
    setSelectedDay(todayDay);
  };

  const days: number[] = [];
  for (let d = windowStart; d < windowStart + WINDOW && d <= 180; d++) {
    days.push(d);
  }

  const getDayStatus = (day: number) => {
    const log = dailyLogs[day];
    if (!log) return day < todayDay ? 'missed' : 'not_started';
    if (log.freezeUsed) return 'freeze_used';
    if (log.completionType === 'perfect') return 'perfect';
    if (log.status === 'completed' || log.completionType === 'minimum') return 'completed';
    if (log.status === 'missed' || log.completionType === 'missed') return 'missed';
    return 'not_started';
  };

  return (
    <div className="relative mb-4">
      {/* Background glow strip */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-950/10 via-blue-950/10 to-purple-950/10 blur-sm pointer-events-none" />

      <div className="relative flex gap-1.5 items-center p-2 border border-white/5 rounded-2xl bg-black/60 backdrop-blur-md select-none">

        {/* ← Previous week button */}
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`shrink-0 flex items-center justify-center h-10 w-8 rounded-xl border transition-all duration-200 ${
            canGoBack
              ? 'border-white/10 bg-white/5 text-white/60 hover:bg-red-950/40 hover:border-red-500/40 hover:text-red-400 hover:shadow-[0_0_10px_rgba(220,38,38,0.2)]'
              : 'border-white/3 text-white/10 cursor-not-allowed'
          }`}
          title="Previous days"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Day buttons */}
        {days.map((day) => {
          const isSelected = day === selectedDay;
          const isToday = day === todayDay;
          const status = getDayStatus(day);
          const cfg = STATUS_CONFIG[status];
          const dateObj = getDateForDay(day, userProfile.startDate);
          const dateLabel = formatDate(dateObj).split(',')[1]?.trim() || formatDate(dateObj);
          const shortDate = dateLabel.split(' ')[0];

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`
                flex-1 min-w-[44px] max-w-[64px] flex flex-col items-center justify-center 
                p-2 rounded-xl border transition-all duration-300 relative overflow-hidden
                ${isSelected
                  ? 'bg-gradient-to-b from-blue-900/40 to-red-900/30 border-blue-400/50 text-white scale-105 shadow-[0_0_20px_rgba(59,130,246,0.35),0_0_8px_rgba(220,38,38,0.2)]'
                  : `${cfg.bg} ${cfg.border} ${cfg.glow} text-white/60 hover:text-white hover:scale-102 hover:border-white/20`
                }
              `}
            >
              {/* Active day animated rings */}
              {isSelected && (
                <>
                  <div className="absolute inset-0 rounded-xl border-2 border-blue-400/20 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-[-2px] rounded-xl border border-red-500/15 animate-ping pointer-events-none" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                </>
              )}

              {/* TODAY badge */}
              {isToday && !isSelected && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              )}

              {/* Day label */}
              <span className={`text-[7px] font-black uppercase tracking-wider ${isSelected ? 'text-blue-300' : isToday ? 'text-purple-400/80' : 'text-white/40'}`}>
                {isToday ? 'TODAY' : `D${day}`}
              </span>

              {/* Status emoji or date */}
              <span className={`text-sm font-black leading-none my-0.5 ${isSelected ? 'text-white' : ''}`}>
                {cfg.emoji || shortDate}
              </span>

              {/* Indicator dot */}
              <div className={`h-1 w-1 rounded-full mt-0.5 ${
                status === 'completed' || status === 'perfect' ? 'bg-emerald-400' :
                status === 'missed' ? 'bg-red-500' :
                status === 'freeze_used' ? 'bg-cyan-400' :
                isSelected ? 'bg-blue-400 animate-pulse' :
                isToday ? 'bg-purple-400 animate-pulse' : 'bg-white/20'
              }`} />
            </button>
          );
        })}

        {/* → Next week button */}
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className={`shrink-0 flex items-center justify-center h-10 w-8 rounded-xl border transition-all duration-200 ${
            canGoForward
              ? 'border-white/10 bg-white/5 text-white/60 hover:bg-blue-950/40 hover:border-blue-500/40 hover:text-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]'
              : 'border-white/3 text-white/10 cursor-not-allowed'
          }`}
          title="Next days"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Jump to today pill */}
        {selectedDay !== todayDay && (
          <button
            onClick={jumpToToday}
            className="shrink-0 px-2 py-1.5 rounded-xl text-[7px] font-black uppercase tracking-widest font-mono transition border border-purple-500/30 bg-purple-950/30 text-purple-400 hover:bg-purple-950/50 hover:shadow-[0_0_8px_rgba(168,85,247,0.2)]"
          >
            ↩ Today
          </button>
        )}
      </div>

      {/* Viewing past day banner */}
      {selectedDay !== todayDay && (
        <div className="mt-1.5 flex items-center gap-2 px-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
          <span className="text-[8px] font-black text-yellow-500/60 uppercase tracking-widest font-mono">
            👁️ Viewing Day {selectedDay} — {formatDate(getDateForDay(selectedDay, userProfile.startDate))}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        </div>
      )}
    </div>
  );
};
