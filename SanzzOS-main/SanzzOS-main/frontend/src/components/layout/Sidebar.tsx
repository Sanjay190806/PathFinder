import React, { useState } from 'react';
import { useUIStore } from '../../app/store/useUIStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { navigateToPath, sectionToPath } from '../../utils/navigation';
import { RankBadge } from '../ui/RankBadge';
import { XPProgressBar } from '../ui/XPProgressBar';
import { getAnimeRankInfo } from '../../utils/animeLevelUtils';
import {
  LayoutDashboard,
  Gauge,
  Languages,
  BadgeCheck,
  BarChart3,
  FileText,
  ListChecks,
  FlaskConical,
  Brain,
  Sigma,
  BookOpen,
  FolderKanban,
  CalendarClock,
  PartyPopper,
  History,
  Settings2,
  Menu,
  PanelLeftClose,
  Bot,
  Sparkles,
  Code2,
  TrendingUp,
  Building2,
  CalendarCheck,
  GraduationCap,
  GitFork,
  PlugZap,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

// ─── Character-themed nav item config ──────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  character: string;
  activeGlow: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  dotColor: string;
}

const CORE_ITEMS: NavItem[] = [
  {
    id: 'overview', label: 'Overview', icon: LayoutDashboard,
    emoji: '🕷️', character: 'Spider-Verse',
    activeGlow: 'shadow-[0_0_12px_rgba(220,38,38,0.3)]',
    activeBg: 'bg-gradient-to-r from-red-950/50 via-blue-950/30 to-transparent',
    activeBorder: 'border-l-2 border-l-red-500/60',
    activeText: 'text-red-300', dotColor: 'bg-red-500'
  },
  {
    id: 'today', label: 'Today', icon: Gauge,
    emoji: '🦇', character: "Gotham's Daily",
    activeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-500/60',
    activeText: 'text-yellow-300', dotColor: 'bg-yellow-500'
  },
  {
    id: 'ai_brain', label: 'AI Brain', icon: Brain,
    emoji: '🃏', character: 'Joker Protocol',
    activeGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    activeBg: 'bg-gradient-to-r from-purple-950/50 via-green-950/20 to-transparent',
    activeBorder: 'border-l-2 border-l-purple-500/60',
    activeText: 'text-purple-300', dotColor: 'bg-purple-500'
  },
  {
    id: 'smart_planner', label: 'Smart Planner', icon: CalendarCheck,
    emoji: '🍥', character: 'Hokage Plan',
    activeGlow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
    activeBg: 'bg-gradient-to-r from-orange-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-orange-500/60',
    activeText: 'text-orange-300', dotColor: 'bg-orange-500'
  },
  {
    id: 'placement_os', label: 'Placement OS', icon: Building2,
    emoji: '🌊', character: 'Slayer Corps',
    activeGlow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    activeBg: 'bg-gradient-to-r from-blue-950/50 via-cyan-950/20 to-transparent',
    activeBorder: 'border-l-2 border-l-blue-500/60',
    activeText: 'text-blue-300', dotColor: 'bg-blue-500'
  },
  {
    id: 'learning_os', label: 'Learning OS', icon: GraduationCap,
    emoji: '📓', character: 'Death Note',
    activeGlow: 'shadow-[0_0_10px_rgba(239,68,68,0.25)]',
    activeBg: 'bg-gradient-to-r from-red-950/60 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-red-700/60',
    activeText: 'text-red-400', dotColor: 'bg-red-700'
  },
  {
    id: 'placement_calendar', label: 'Placement Calendar', icon: CalendarClock,
    emoji: '⚡', character: 'Titan Alert',
    activeGlow: 'shadow-[0_0_10px_rgba(234,179,8,0.25)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-600/50',
    activeText: 'text-yellow-400', dotColor: 'bg-yellow-600'
  },
  {
    id: 'applications', label: 'Applications', icon: FileText,
    emoji: '🕷️', character: 'Web Network',
    activeGlow: 'shadow-[0_0_10px_rgba(220,38,38,0.2)]',
    activeBg: 'bg-gradient-to-r from-red-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-red-600/50',
    activeText: 'text-red-400', dotColor: 'bg-red-600'
  },
  {
    id: 'companies', label: 'Target Companies', icon: Building2,
    emoji: '🦇', character: 'Wayne Corp',
    activeGlow: 'shadow-[0_0_10px_rgba(234,179,8,0.2)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-700/50',
    activeText: 'text-yellow-500', dotColor: 'bg-yellow-700'
  },
  {
    id: 'company_intelligence', label: 'Company Intel', icon: Building2,
    emoji: '🃏', character: 'Chaos Intel',
    activeGlow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    activeBg: 'bg-gradient-to-r from-purple-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-purple-700/50',
    activeText: 'text-purple-400', dotColor: 'bg-purple-700'
  },
];

const PREP_ITEMS: NavItem[] = [
  {
    id: 'roadmap', label: 'Roadmap', icon: BadgeCheck,
    emoji: '🍥', character: 'Shinobi Path',
    activeGlow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
    activeBg: 'bg-gradient-to-r from-orange-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-orange-500/60',
    activeText: 'text-orange-300', dotColor: 'bg-orange-500'
  },
  {
    id: 'dsa_tracker', label: 'DSA Tracker', icon: ListChecks,
    emoji: '🕷️', character: 'Web Patrol',
    activeGlow: 'shadow-[0_0_12px_rgba(220,38,38,0.3)]',
    activeBg: 'bg-gradient-to-r from-red-950/50 via-blue-950/25 to-transparent',
    activeBorder: 'border-l-2 border-l-red-500/60',
    activeText: 'text-red-300', dotColor: 'bg-red-500'
  },
  {
    id: 'skillrack', label: 'SkillRack', icon: FlaskConical,
    emoji: '⚡', character: 'Speed Force',
    activeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-500/60',
    activeText: 'text-yellow-300', dotColor: 'bg-yellow-500'
  },
  {
    id: 'aptitude', label: 'Aptitude', icon: Brain,
    emoji: '🃏', character: 'Mind Game',
    activeGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    activeBg: 'bg-gradient-to-r from-purple-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-purple-500/60',
    activeText: 'text-purple-300', dotColor: 'bg-purple-500'
  },
  {
    id: 'sql', label: 'SQL', icon: Sigma,
    emoji: '🌊', character: 'Data Flow',
    activeGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    activeBg: 'bg-gradient-to-r from-cyan-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-cyan-500/60',
    activeText: 'text-cyan-300', dotColor: 'bg-cyan-500'
  },
  {
    id: 'cscore', label: 'CS Core', icon: BookOpen,
    emoji: '📓', character: 'System Scroll',
    activeGlow: 'shadow-[0_0_10px_rgba(239,68,68,0.25)]',
    activeBg: 'bg-gradient-to-r from-red-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-red-700/60',
    activeText: 'text-red-400', dotColor: 'bg-red-700'
  },
  {
    id: 'skill_tree', label: 'Skill Tree', icon: GitFork,
    emoji: '🍥', character: 'Justu Tree',
    activeGlow: 'shadow-[0_0_10px_rgba(249,115,22,0.25)]',
    activeBg: 'bg-gradient-to-r from-orange-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-orange-600/50',
    activeText: 'text-orange-400', dotColor: 'bg-orange-600'
  },
  {
    id: 'mock_interview_os', label: 'Mock Interview', icon: MessageSquare,
    emoji: '🦇', character: 'Gotham Trial',
    activeGlow: 'shadow-[0_0_10px_rgba(234,179,8,0.25)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-600/50',
    activeText: 'text-yellow-400', dotColor: 'bg-yellow-600'
  },
];

const ASSETS_ITEMS: NavItem[] = [
  {
    id: 'resume', label: 'Resume Studio', icon: FileText,
    emoji: '🕷️', character: 'Web Resume',
    activeGlow: 'shadow-[0_0_12px_rgba(220,38,38,0.3)]',
    activeBg: 'bg-gradient-to-r from-red-950/50 via-blue-950/25 to-transparent',
    activeBorder: 'border-l-2 border-l-red-500/60',
    activeText: 'text-red-300', dotColor: 'bg-red-500'
  },
  {
    id: 'portfolio_os', label: 'Portfolio OS', icon: FolderKanban,
    emoji: '🦇', character: 'Bat-Portfolio',
    activeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-500/60',
    activeText: 'text-yellow-300', dotColor: 'bg-yellow-500'
  },
  {
    id: 'integrations', label: 'Integrations', icon: PlugZap,
    emoji: '⚡', character: 'Chakra Link',
    activeGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    activeBg: 'bg-gradient-to-r from-cyan-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-cyan-500/60',
    activeText: 'text-cyan-300', dotColor: 'bg-cyan-500'
  },
  {
    id: 'projects', label: 'Projects Showcase', icon: FolderKanban,
    emoji: '🍥', character: 'Hokage Works',
    activeGlow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
    activeBg: 'bg-gradient-to-r from-orange-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-orange-500/60',
    activeText: 'text-orange-300', dotColor: 'bg-orange-500'
  },
  {
    id: 'german', label: 'German Academy', icon: Languages,
    emoji: '📓', character: 'Shinigami Lang',
    activeGlow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    activeBg: 'bg-gradient-to-r from-red-950/60 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-red-700/60',
    activeText: 'text-red-400', dotColor: 'bg-red-700'
  },
  {
    id: 'achievements', label: 'Achievements', icon: PartyPopper,
    emoji: '⭐', character: 'Sage Mode',
    activeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.35)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/50 via-amber-950/20 to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-400/60',
    activeText: 'text-yellow-200', dotColor: 'bg-yellow-400'
  },
  {
    id: 'history', label: 'History Logs', icon: History,
    emoji: '🌊', character: 'Corps Archive',
    activeGlow: 'shadow-[0_0_10px_rgba(59,130,246,0.25)]',
    activeBg: 'bg-gradient-to-r from-blue-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-blue-600/50',
    activeText: 'text-blue-400', dotColor: 'bg-blue-600'
  },
];

const AI_ITEMS: NavItem[] = [
  {
    id: 'ai', label: 'Shayla AI Mentor', icon: Bot,
    emoji: '🃏', character: 'Chaos Mentor',
    activeGlow: 'shadow-[0_0_14px_rgba(168,85,247,0.4)]',
    activeBg: 'bg-gradient-to-r from-purple-950/60 via-green-950/20 to-transparent',
    activeBorder: 'border-l-2 border-l-purple-400/70',
    activeText: 'text-purple-200', dotColor: 'bg-purple-400'
  },
  {
    id: 'ai_mentor', label: 'AI Mentor', icon: Bot,
    emoji: '🍥', character: 'Sage Mentor',
    activeGlow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
    activeBg: 'bg-gradient-to-r from-orange-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-orange-500/60',
    activeText: 'text-orange-300', dotColor: 'bg-orange-500'
  },
  {
    id: 'interview_coach', label: 'Interview Coach', icon: Bot,
    emoji: '🦇', character: 'Bat-Coach',
    activeGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-500/60',
    activeText: 'text-yellow-300', dotColor: 'bg-yellow-500'
  },
  {
    id: 'coding_mentor', label: 'Coding Mentor', icon: Code2,
    emoji: '🕷️', character: 'Code Spider',
    activeGlow: 'shadow-[0_0_12px_rgba(220,38,38,0.3)]',
    activeBg: 'bg-gradient-to-r from-red-950/50 via-blue-950/25 to-transparent',
    activeBorder: 'border-l-2 border-l-red-500/60',
    activeText: 'text-red-300', dotColor: 'bg-red-500'
  },
  {
    id: 'career_intelligence', label: 'Career Intel', icon: TrendingUp,
    emoji: '🌊', character: 'Slayer Intel',
    activeGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    activeBg: 'bg-gradient-to-r from-cyan-950/50 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-cyan-500/60',
    activeText: 'text-cyan-300', dotColor: 'bg-cyan-500'
  },
  {
    id: 'ai_settings', label: 'AI Settings', icon: Settings2,
    emoji: '⚙️', character: 'Neural Config',
    activeGlow: 'shadow-[0_0_10px_rgba(168,85,247,0.25)]',
    activeBg: 'bg-gradient-to-r from-purple-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-purple-600/50',
    activeText: 'text-purple-400', dotColor: 'bg-purple-600'
  },
  {
    id: 'shayla_memory', label: 'Shayla Memory', icon: Brain,
    emoji: '🃏', character: 'Chaos Memory',
    activeGlow: 'shadow-[0_0_10px_rgba(168,85,247,0.25)]',
    activeBg: 'bg-gradient-to-r from-purple-950/40 via-green-950/15 to-transparent',
    activeBorder: 'border-l-2 border-l-purple-600/50',
    activeText: 'text-purple-400', dotColor: 'bg-purple-600'
  },
  {
    id: 'ai_playground', label: 'AI Playground', icon: Sparkles,
    emoji: '✨', character: 'Chakra Lab',
    activeGlow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
    activeBg: 'bg-gradient-to-r from-orange-950/50 via-pink-950/20 to-transparent',
    activeBorder: 'border-l-2 border-l-orange-500/60',
    activeText: 'text-orange-300', dotColor: 'bg-orange-500'
  },
  {
    id: 'ai_benchmark', label: 'AI Benchmark', icon: BarChart3,
    emoji: '⚡', character: 'Titan Speed',
    activeGlow: 'shadow-[0_0_10px_rgba(234,179,8,0.25)]',
    activeBg: 'bg-gradient-to-r from-yellow-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-yellow-600/50',
    activeText: 'text-yellow-400', dotColor: 'bg-yellow-600'
  },
  {
    id: 'analytics', label: 'Analytics', icon: BarChart3,
    emoji: '🕷️', character: 'Spider-Stats',
    activeGlow: 'shadow-[0_0_10px_rgba(220,38,38,0.2)]',
    activeBg: 'bg-gradient-to-r from-red-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-red-600/50',
    activeText: 'text-red-400', dotColor: 'bg-red-600'
  },
  {
    id: 'reports', label: 'Reports', icon: FileText,
    emoji: '📓', character: 'Death Reports',
    activeGlow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    activeBg: 'bg-gradient-to-r from-red-950/40 via-black to-transparent',
    activeBorder: 'border-l-2 border-l-red-700/50',
    activeText: 'text-red-500', dotColor: 'bg-red-700'
  },
];

// ─── Cinematic Nav Item Component ──────────────────────────────────────────
const CinematicNavItem: React.FC<{
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}> = ({ item, isActive, collapsed, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`
        group relative w-full text-left flex items-center gap-2.5
        rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200
        overflow-hidden select-none mb-0.5
        ${isActive
          ? `${item.activeBg} ${item.activeBorder} ${item.activeText} ${item.activeGlow}`
          : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04] border-l-2 border-l-transparent'
        }
      `}
    >
      {/* Active shimmer line */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      )}

      {/* Emoji or Icon */}
      <div className={`relative shrink-0 flex items-center justify-center ${collapsed ? 'w-full' : ''}`}>
        {isActive ? (
          <span className="text-sm leading-none">{item.emoji}</span>
        ) : (
          <Icon className="h-3.5 w-3.5 shrink-0" />
        )}
        {/* Active status dot */}
        {isActive && (
          <span className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${item.dotColor} animate-pulse`} />
        )}
      </div>

      {/* Label */}
      {!collapsed && (
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate leading-none">{item.label}</span>
          {isActive && (
            <span className={`text-[7px] font-black uppercase tracking-widest font-mono mt-0.5 opacity-60 truncate`}>
              {item.character}
            </span>
          )}
        </div>
      )}

      {/* Hover glow edge for inactive */}
      {!isActive && (
        <div className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-white/0 group-hover:bg-white/20 transition-all duration-200" />
      )}
    </button>
  );
};

// ─── Cinematic Section Label ────────────────────────────────────────────────
const SectionLabel: React.FC<{
  emoji: string;
  label: string;
  gradientClass: string;
  collapsed: boolean;
}> = ({ emoji, label, gradientClass, collapsed }) => {
  if (collapsed) return <div className="border-t border-white/5 my-2 mx-1" />;
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 mt-4 mb-1">
      <span className="text-sm">{emoji}</span>
      <span className={`text-[11px] font-black uppercase tracking-[0.18em] font-mono bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
        {label}
      </span>
      <div className={`flex-1 h-px bg-gradient-to-r ${gradientClass} opacity-25`} />
    </div>
  );
};

// ─── Main Sidebar ───────────────────────────────────────────────────────────
export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, activeSection, setActiveSection } = useUIStore();
  const [aiToolsExpanded, setAiToolsExpanded] = useState(true);

  const profileName = useCareerStore((s) => s.userProfile.name);
  const xp = useCareerStore((s) => s.xp);
  const level = useCareerStore((s) => s.level);
  const anime = getAnimeRankInfo(level);

  const handleNav = (id: string) => {
    const path = sectionToPath[id];
    if (path) {
      navigateToPath(path);
    } else {
      setActiveSection(id);
    }
  };

  return (
    <aside
      className={`hidden flex-col border-r border-white/5 backdrop-blur-xl md:flex shell-sidebar relative overflow-hidden ${
        sidebarCollapsed ? 'shell-sidebar--collapsed' : ''
      }`}
      style={{ background: 'linear-gradient(180deg, rgba(8,0,18,0.97) 0%, rgba(5,5,12,0.97) 100%)' }}
    >
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-950/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-red-950/5 to-transparent pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-4 shrink-0 relative z-10">
        {!sidebarCollapsed ? (
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400/60 font-mono">Career OS</span>
            <span className="text-sm font-black text-white tracking-tight">Sanju Tracker</span>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-950/30 text-lg">
            🕷️
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-white/40 transition hover:border-purple-500/30 hover:bg-purple-950/30 hover:text-purple-300"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <Menu className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── RPG Status Card ── */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-3 p-3 rounded-2xl relative overflow-hidden select-none z-10"
          style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
          {/* Scanline */}
          <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%)', backgroundSize: '100% 3px' }} />

          <div className="flex items-center gap-2.5 relative z-10">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.15))', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 0 12px rgba(168,85,247,0.2)' }}>
              {profileName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-white truncate">{profileName}</span>
              <div className="mt-0.5">
                <RankBadge xp={xp} />
              </div>
            </div>
          </div>

          <div className="mt-2.5 relative z-10">
            <XPProgressBar currentXp={xp} level={level} />
          </div>

          {/* Anime rank pills */}
          <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-white/5 relative z-10">
            <span className="text-[7px] font-black px-1.5 py-0.5 rounded font-mono bg-orange-950/50 border border-orange-700/25 text-orange-400">🍥 {anime.narutoRank.split(' ')[0]}</span>
            <span className="text-[7px] font-black px-1.5 py-0.5 rounded font-mono bg-blue-950/50 border border-blue-700/25 text-blue-400">🌊 {anime.demonSlayerRank.split(' ')[0]}</span>
            <span className="text-[7px] font-black px-1.5 py-0.5 rounded font-mono bg-red-950/50 border border-red-900/25 text-red-400">🕷️ Lvl {level}</span>
            <span className="text-[7px] font-black px-1.5 py-0.5 rounded font-mono bg-yellow-950/50 border border-yellow-700/25 text-yellow-500">🦇 {xp} XP</span>
          </div>
        </div>
      )}

      {/* ── Nav List ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 select-none flex flex-col scrollbar-none relative z-10">

        <SectionLabel emoji="🕷️" label="Core Tracker" gradientClass="from-red-500 to-blue-500" collapsed={sidebarCollapsed} />
        {CORE_ITEMS.map(item => (
          <CinematicNavItem key={item.id} item={item} isActive={activeSection === item.id} collapsed={sidebarCollapsed} onClick={() => handleNav(item.id)} />
        ))}

        <SectionLabel emoji="🍥" label="Placement Prep" gradientClass="from-orange-400 to-yellow-300" collapsed={sidebarCollapsed} />
        {PREP_ITEMS.map(item => (
          <CinematicNavItem key={item.id} item={item} isActive={activeSection === item.id} collapsed={sidebarCollapsed} onClick={() => handleNav(item.id)} />
        ))}

        <SectionLabel emoji="🦇" label="Career Assets" gradientClass="from-yellow-400 to-amber-300" collapsed={sidebarCollapsed} />
        {ASSETS_ITEMS.map(item => (
          <CinematicNavItem key={item.id} item={item} isActive={activeSection === item.id} collapsed={sidebarCollapsed} onClick={() => handleNav(item.id)} />
        ))}

        {/* ── Collapsible AI Tools ── */}
        <div className="mt-1">
          {!sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setAiToolsExpanded(!aiToolsExpanded)}
              className="w-full flex items-center justify-between px-2 py-1.5 mt-4 mb-1 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🃏</span>
                <span className="text-[11px] font-black uppercase tracking-[0.18em] font-mono bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                  AI &amp; Tools
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-500/25 to-transparent ml-1" />
              </div>
              {aiToolsExpanded
                ? <ChevronDown className="h-3.5 w-3.5 text-purple-400/50" />
                : <ChevronRight className="h-3.5 w-3.5 text-purple-400/50" />}
            </button>
          ) : (
            <div className="border-t border-white/5 my-2 mx-1" />
          )}
          {(sidebarCollapsed || aiToolsExpanded) && AI_ITEMS.map(item => (
            <CinematicNavItem key={item.id} item={item} isActive={activeSection === item.id} collapsed={sidebarCollapsed} onClick={() => handleNav(item.id)} />
          ))}
        </div>
      </nav>

      {/* ── Settings ── */}
      <div className="border-t border-white/5 p-2 shrink-0 relative z-10">
        <CinematicNavItem
          item={{
            id: 'settings', label: 'Settings', icon: Settings2,
            emoji: '⚙️', character: 'System Config',
            activeGlow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]',
            activeBg: 'bg-gradient-to-r from-purple-950/40 via-black to-transparent',
            activeBorder: 'border-l-2 border-l-purple-600/50',
            activeText: 'text-purple-400', dotColor: 'bg-purple-600'
          }}
          isActive={activeSection === 'settings'}
          collapsed={sidebarCollapsed}
          onClick={() => setActiveSection('settings')}
        />
      </div>
    </aside>
  );
};
