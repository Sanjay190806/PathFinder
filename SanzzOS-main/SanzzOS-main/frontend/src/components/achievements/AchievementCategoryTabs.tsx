import React from 'react';
import { AchievementCategory } from '../../types/achievements';

interface AchievementCategoryTabsProps {
  activeCategory: AchievementCategory | 'all';
  onChangeCategory: (cat: AchievementCategory | 'all') => void;
}

const CHARACTER_TAB_CONFIG: Record<
  AchievementCategory | 'all',
  { label: string; activeBorder: string; activeBg: string; activeText: string; activeGlow: string }
> = {
  all:       { label: '🛡️ All Badges',    activeBorder: 'border-white/40',       activeBg: 'bg-white/10',                     activeText: 'text-white',          activeGlow: 'shadow-[0_0_12px_rgba(255,255,255,0.15)]' },
  dsa:       { label: '🕷️ Spider-Verse',  activeBorder: 'border-red-500/50',     activeBg: 'bg-red-950/30',                   activeText: 'text-red-400',        activeGlow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]' },
  placement: { label: '🦇 Gotham Knight', activeBorder: 'border-yellow-500/50',  activeBg: 'bg-yellow-950/30',                activeText: 'text-yellow-400',     activeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]' },
  daily:     { label: '🍥 Hidden Leaf',   activeBorder: 'border-orange-500/50',  activeBg: 'bg-orange-950/30',                activeText: 'text-orange-400',     activeGlow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]' },
  learning:  { label: '⭐ Sage Mode',     activeBorder: 'border-yellow-400/50',  activeBg: 'bg-yellow-950/30',                activeText: 'text-yellow-300',     activeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]' },
  german:    { label: '📓 Death Note',    activeBorder: 'border-red-600/50',     activeBg: 'bg-red-950/40',                   activeText: 'text-red-500',        activeGlow: 'shadow-[0_0_12px_rgba(220,38,38,0.25)]' },
  projects:  { label: '🌊 Slayer Corps',  activeBorder: 'border-cyan-500/50',     activeBg: 'bg-cyan-950/30',                  activeText: 'text-cyan-400',       activeGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]' },
  ai_planner:{ label: '🃏 Joker Chaos',   activeBorder: 'border-purple-500/50',  activeBg: 'bg-purple-950/30',                activeText: 'text-purple-400',     activeGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]' },
  sql:       { label: '🗄️ SQL Master',    activeBorder: 'border-blue-500/50',     activeBg: 'bg-blue-950/30',                  activeText: 'text-blue-400',       activeGlow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]' },
  aptitude:  { label: '🧮 Aptitude',     activeBorder: 'border-purple-600/50',  activeBg: 'bg-purple-950/30',                activeText: 'text-purple-300',     activeGlow: 'shadow-[0_0_12px_rgba(147,51,234,0.3)]' },
  resume:    { label: '📄 Resume',       activeBorder: 'border-emerald-500/50', activeBg: 'bg-emerald-950/30',               activeText: 'text-emerald-400',    activeGlow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]' },
  interview: { label: '🎯 Interview STAR',activeBorder: 'border-pink-500/50',    activeBg: 'bg-pink-950/30',                  activeText: 'text-pink-400',       activeGlow: 'shadow-[0_0_12px_rgba(236,72,153,0.3)]' },
  comeback:  { label: '🔥 Comeback Run',  activeBorder: 'border-red-500/50',     activeBg: 'bg-red-950/30',                   activeText: 'text-red-400',        activeGlow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]' },
  skillrack: { label: '⚡ SkillRack',     activeBorder: 'border-blue-400/50',    activeBg: 'bg-blue-950/20',                  activeText: 'text-blue-400',       activeGlow: 'shadow-[0_0_12px_rgba(59,130,246,0.25)]' },
};

export const AchievementCategoryTabs: React.FC<AchievementCategoryTabsProps> = ({
  activeCategory,
  onChangeCategory
}) => {
  const tabs: (AchievementCategory | 'all')[] = [
    'all',
    'daily',
    'dsa',
    'sql',
    'aptitude',
    'learning',
    'german',
    'projects',
    'resume',
    'placement',
    'interview',
    'ai_planner'
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 select-none">
      {tabs.map((tabId) => {
        const config = CHARACTER_TAB_CONFIG[tabId] || {
          label: tabId,
          activeBorder: 'border-purple-500/50',
          activeBg: 'bg-purple-950/20',
          activeText: 'text-purple-400',
          activeGlow: 'shadow-none'
        };
        const isActive = activeCategory === tabId;

        return (
          <button
            key={tabId}
            type="button"
            onClick={() => onChangeCategory(tabId)}
            className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              isActive
                ? `${config.activeBorder} ${config.activeBg} ${config.activeText} ${config.activeGlow} scale-102`
                : 'border-white/5 bg-white/[0.01] text-textSecondary hover:bg-white/5 hover:border-white/10'
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
export default AchievementCategoryTabs;
