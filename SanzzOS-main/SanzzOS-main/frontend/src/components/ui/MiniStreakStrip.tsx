import React, { useMemo } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { Card } from './Card';
import { getTodayDay } from '../../utils/dateUtils';

interface StatusTheme {
  bg: string;
  border: string;
  glow: string;
  text: string;
  emoji: string;
  character: string;
  indicator: string;
}

const STATUS_THEME: Record<string, StatusTheme> = {
  'Streak Frozen': {
    bg: 'from-blue-950/40 via-cyan-950/20 to-black/80',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    text: 'text-cyan-400',
    emoji: '❄️',
    character: 'BAT-ICE',
    indicator: 'bg-cyan-400'
  },
  'Perfect Day': {
    bg: 'from-yellow-950/45 via-amber-950/25 to-black/80',
    border: 'border-yellow-400/40',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.35)]',
    text: 'text-yellow-400',
    emoji: '⭐',
    character: '🍥 SAGE',
    indicator: 'bg-yellow-400'
  },
  'Minimum Day Qualified': {
    bg: 'from-emerald-950/45 via-teal-950/25 to-black/80',
    border: 'border-emerald-500/45',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    text: 'text-emerald-400',
    emoji: '🕷️',
    character: 'SPIDEY',
    indicator: 'bg-emerald-400'
  },
  'Partial Work': {
    bg: 'from-orange-950/40 via-red-950/20 to-black/80',
    border: 'border-orange-500/35',
    glow: 'shadow-[0_0_10px_rgba(249,115,22,0.25)]',
    text: 'text-orange-400',
    emoji: '⚡',
    character: '🌊 CORPS',
    indicator: 'bg-orange-400'
  },
  'Missed': {
    bg: 'from-red-950/45 via-black to-black',
    border: 'border-red-600/40',
    glow: 'shadow-[0_0_12px_rgba(220,38,38,0.35)]',
    text: 'text-red-500',
    emoji: '📓',
    character: 'SHINIGAMI',
    indicator: 'bg-red-500'
  },
  'Today (Pending)': {
    bg: 'from-purple-950/40 via-blue-950/20 to-black/80',
    border: 'border-purple-500/40 border-dashed animate-pulse',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    text: 'text-purple-400',
    emoji: '🃏',
    character: 'CHAOS',
    indicator: 'bg-purple-400 animate-ping'
  },
  'Future': {
    bg: 'from-white/[0.02] to-black/90',
    border: 'border-white/5',
    glow: '',
    text: 'text-white/20',
    emoji: '🔒',
    character: 'LOCKED',
    indicator: 'bg-white/10'
  }
};

export const MiniStreakStrip: React.FC = () => {
  const { dailyLogs, userProfile } = useCareerStore();
  const todayDay = getTodayDay(userProfile.startDate);

  const days = useMemo(() => {
    // Generate last 28 days ending with todayDay (or todayDay + 2 to show some future cells)
    const end = Math.min(todayDay + 2, 184);
    const start = Math.max(end - 27, 1);
    
    const list = [];
    for (let d = start; d <= end; d++) {
      const log = dailyLogs[d];
      const dateObj = new Date(userProfile.startDate);
      dateObj.setDate(dateObj.getDate() + (d - 1));
      const dateStr = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      
      let statusText = 'Future';
      let xp = 0;
      let tasksText = 'No tasks logged';

      if (d <= todayDay) {
        if (log) {
          xp = log.xpEarned || 0;
          tasksText = log.note || 'Logged work';
          
          if (log.freezeUsed) {
            statusText = 'Streak Frozen';
          } else if (log.completionType === 'perfect') {
            statusText = 'Perfect Day';
          } else if (log.completionType === 'minimum' || log.status === 'completed') {
            statusText = 'Minimum Day Qualified';
          } else if (log.status === 'partial') {
            statusText = 'Partial Work';
          } else {
            statusText = 'Missed';
          }
        } else {
          if (d < todayDay) {
            statusText = 'Missed';
          } else {
            statusText = 'Today (Pending)';
          }
        }
      }

      list.push({
        dayNum: d,
        dateStr,
        statusText,
        xp,
        tasksText,
        isToday: d === todayDay
      });
    }
    return list;
  }, [dailyLogs, todayDay, userProfile.startDate]);

  return (
    <Card 
      className="p-5 border-purple-950/15 relative overflow-visible"
      style={{
        background: 'linear-gradient(135deg, rgba(15,0,30,0.7) 0%, rgba(5,5,15,0.7) 100%)',
        border: '1px solid rgba(168,85,247,0.1)'
      }}
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.03] blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/[0.03] blur-2xl pointer-events-none" />

      {/* Header section with cinematic label */}
      <div className="flex justify-between items-center mb-3.5 flex-wrap gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">28-Day Shinobi Streak Scroll</span>
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-wider text-white/30 font-mono">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Spidey (Done)</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Bat-Freeze</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> Perfect</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Missed</span>
        </div>
      </div>

      {/* Grid container with centered layout & card size limitations */}
      <div className="flex flex-wrap gap-2 justify-start items-center relative z-10">
        {days.map((day, index) => {
          const theme = STATUS_THEME[day.statusText] || STATUS_THEME['Future'];
          const tooltipPosition =
            index < 2
              ? 'left-0 translate-x-0'
              : index > days.length - 3
                ? 'right-0 translate-x-0'
                : 'left-1/2 -translate-x-1/2';
          
          return (
            <div
              key={day.dayNum}
              className={`
                group relative flex flex-col items-center justify-center 
                aspect-square w-11 h-11 rounded-xl border transition-all duration-300 cursor-help select-none
                bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow}
                hover:scale-108 hover:border-white/20
                ${day.isToday ? 'outline-double outline-purple-400 outline-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] z-20 scale-102' : ''}
                hover:z-50
              `}
            >
              {/* Day Number */}
              <span className={`text-[10px] font-black leading-none ${day.isToday ? 'text-purple-300' : 'text-white/80'}`}>
                {day.dayNum}
              </span>

              {/* Status icon / indicator */}
              <span className="text-[9px] mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                {theme.emoji}
              </span>

              {/* Indicator dot at the bottom of the card */}
              <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${theme.indicator}`} />

              {/* Character Badge display on hover */}
              <span className="absolute top-0.5 right-1 text-[5px] font-mono tracking-tighter opacity-20 uppercase">
                {theme.character}
              </span>

              {/* CSS Tooltip */}
              <div className={`absolute bottom-full ${tooltipPosition} mb-2 hidden group-hover:block z-[100] pointer-events-none bg-black/95 border border-purple-500/20 p-3 rounded-xl text-[9px] w-56 max-w-[min(14rem,calc(100vw-2rem))] shadow-[0_0_20px_rgba(168,85,247,0.25)] leading-normal backdrop-blur-md whitespace-normal`}>
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-1">
                  <span className="font-black text-white leading-tight">Day {day.dayNum} ({day.dateStr})</span>
                  {day.isToday && <span className="text-[7px] font-black bg-purple-500/20 border border-purple-500/30 px-1 py-0.5 rounded text-purple-300 font-mono">TODAY</span>}
                </div>
                <span className={`font-black block mt-1 ${theme.text}`}>{day.statusText}</span>
                <span className="text-yellow-400 font-bold block">+{day.xp} XP</span>
                <span className="text-white/60 block mt-1 leading-snug font-mono text-[8px] break-words">{day.tasksText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
