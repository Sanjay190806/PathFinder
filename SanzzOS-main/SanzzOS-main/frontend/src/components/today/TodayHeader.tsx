import React from 'react';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getDateForDay, formatDate, getPhaseName } from '../../utils/dateUtils';
import { ROADMAP } from '../../data/roadmap';
import { Badge } from '../ui/Badge';
import { getAnimeRankInfo } from '../../utils/animeLevelUtils';

// Topic → color/icon mapping
const TOPIC_THEME: Record<string, { color: string; glow: string; emoji: string }> = {
  'Arrays':         { color: 'text-blue-400',   glow: 'shadow-[0_0_16px_rgba(59,130,246,0.4)]',  emoji: '🔵' },
  'Strings':        { color: 'text-emerald-400', glow: 'shadow-[0_0_16px_rgba(16,185,129,0.4)]', emoji: '🟢' },
  'Linked List':    { color: 'text-purple-400',  glow: 'shadow-[0_0_16px_rgba(168,85,247,0.4)]', emoji: '🟣' },
  'Binary Tree':    { color: 'text-orange-400',  glow: 'shadow-[0_0_16px_rgba(249,115,22,0.4)]', emoji: '🌳' },
  'Dynamic Programming': { color: 'text-red-400', glow: 'shadow-[0_0_16px_rgba(239,68,68,0.4)]', emoji: '🔴' },
  'Graphs':         { color: 'text-cyan-400',    glow: 'shadow-[0_0_16px_rgba(6,182,212,0.4)]',  emoji: '🔷' },
  'Sorting':        { color: 'text-yellow-400',  glow: 'shadow-[0_0_16px_rgba(234,179,8,0.4)]',  emoji: '⭐' },
  'Recursion':      { color: 'text-pink-400',    glow: 'shadow-[0_0_16px_rgba(236,72,153,0.4)]', emoji: '🌀' },
  'Stack':          { color: 'text-amber-400',   glow: 'shadow-[0_0_16px_rgba(245,158,11,0.4)]', emoji: '📚' },
  'Heap':           { color: 'text-rose-400',    glow: 'shadow-[0_0_16px_rgba(244,63,94,0.4)]',  emoji: '🔺' },
};

const getTopicTheme = (topic: string) => {
  for (const key of Object.keys(TOPIC_THEME)) {
    if (topic.toLowerCase().includes(key.toLowerCase())) return TOPIC_THEME[key];
  }
  return { color: 'text-blue-400', glow: 'shadow-[0_0_14px_rgba(59,130,246,0.3)]', emoji: '⚡' };
};

export const TodayHeader: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const userProfile = useCareerStore((s) => s.userProfile);
  const level = useCareerStore((s) => s.level);
  const xp = useCareerStore((s) => s.xp);
  const anime = getAnimeRankInfo(level);

  const dateObj = getDateForDay(selectedDay, userProfile.startDate);
  const dateFormatted = formatDate(dateObj);
  const phase = getPhaseName(selectedDay);
  const problems = ROADMAP[String(selectedDay)] || [];
  const topic = problems[0]?.topic || 'Revision Phase';
  const topicTheme = getTopicTheme(topic);

  return (
    <div className="relative rounded-2xl overflow-hidden mb-2">
      {/* Dark cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#04001a] via-[#06000d] to-black" />

      {/* Spider-Man web corner overlay */}
      <svg className="absolute top-0 right-0 w-32 h-32 opacity-[0.06] pointer-events-none" viewBox="0 0 100 100">
        {[0, 30, 60, 90, 120, 150].map(a => (
          <line key={a} x1="100" y1="0" x2={100 + 100 * Math.cos((a + 180) * Math.PI / 180)} y2={100 * Math.sin(a * Math.PI / 180)} stroke="#DC2626" strokeWidth="0.8" />
        ))}
        {[25, 50, 75].map(r => (
          <path key={r} d={`M ${100 - r} 0 A ${r} ${r} 0 0 0 100 ${r}`} fill="none" stroke="#3B82F6" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Bat-signal glow behind day number */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-yellow-400/[0.04] blur-2xl pointer-events-none" />

      {/* Background gradient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full bg-blue-500/[0.04] blur-2xl pointer-events-none" />

      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 md:p-6">
        {/* Left: Day info */}
        <div className="flex items-center gap-5">
          {/* Day number badge */}
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900/40 to-red-900/30 border border-blue-500/25 shadow-[0_0_20px_rgba(59,130,246,0.2)] shrink-0">
            <span className="text-[8px] text-blue-400/70 font-black uppercase tracking-widest">DAY</span>
            <span className="text-2xl font-black text-white leading-none">{selectedDay}</span>
            <span className="text-[7px] text-white/30 font-mono">/180</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight">Mission Control</h2>
              <Badge variant="primary">{phase}</Badge>
            </div>
            <p className="text-[10px] text-white/40 mt-0.5 font-mono">{dateFormatted}</p>

            {/* Anime rank pills row */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-orange-950/50 border border-orange-700/25 text-orange-400 font-mono">
                🍥 {anime.narutoRank.split(' ')[0]}
              </span>
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-700/25 text-blue-400 font-mono">
                🌊 {anime.demonSlayerBreathing.split(':')[0]}
              </span>
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-yellow-950/50 border border-yellow-700/25 text-yellow-400 font-mono">
                🦇 Lvl {level}
              </span>
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-red-950/50 border border-red-700/25 text-red-400 font-mono">
                🕷️ {xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Topic card */}
        <div className={`flex items-center gap-3 rounded-2xl border bg-black/40 px-5 py-3 backdrop-blur-md ${topicTheme.glow}`}
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-2xl">{topicTheme.emoji}</span>
          <div>
            <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold block font-mono">Syllabus Topic</span>
            <span className={`text-sm font-black ${topicTheme.color} mt-0.5 block`}>{topic}</span>
            <span className="text-[8px] text-white/20 font-mono">Day {selectedDay} objective</span>
          </div>
        </div>
      </div>
    </div>
  );
};
