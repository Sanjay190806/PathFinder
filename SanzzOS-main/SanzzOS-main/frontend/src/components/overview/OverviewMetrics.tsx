import React from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTotalLCSolved, getActivityTotal, getStreak } from '../../utils/xpUtils';
import { Code2, Sigma, Brain, Boxes, Trophy, CalendarDays, Languages, Flame, Headphones } from 'lucide-react';

interface HeroStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  desc?: string;
  character: 'spider' | 'batman' | 'naruto' | 'demon' | 'deathnote' | 'joker' | 'generic';
  emoji?: string;
}

const CHARACTER_STYLES: Record<HeroStatCardProps['character'], {
  border: string; bg: string; glow: string; accent: string; labelColor: string; valueGradient: string;
}> = {
  spider:    { border: 'border-red-900/40',    bg: 'from-[#150005] via-[#060010] to-black',   glow: 'shadow-[0_0_15px_rgba(220,38,38,0.2)]',    accent: 'bg-red-900/20',    labelColor: 'text-red-500/60',   valueGradient: 'from-red-400 to-blue-400' },
  batman:    { border: 'border-yellow-900/35', bg: 'from-[#0c0900] via-[#05050a] to-black',   glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',    accent: 'bg-yellow-900/20', labelColor: 'text-yellow-600/60', valueGradient: 'from-yellow-400 to-yellow-200' },
  naruto:    { border: 'border-orange-900/40', bg: 'from-[#0d0500] via-[#05050a] to-black',   glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',   accent: 'bg-orange-900/20', labelColor: 'text-orange-500/60', valueGradient: 'from-orange-400 to-yellow-300' },
  demon:     { border: 'border-blue-900/40',   bg: 'from-[#00050f] via-[#03000a] to-black',   glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',   accent: 'bg-blue-900/20',   labelColor: 'text-blue-500/60',   valueGradient: 'from-blue-400 to-cyan-300' },
  deathnote: { border: 'border-red-950/50',    bg: 'from-[#0b0000] via-[#030000] to-black',   glow: 'shadow-[0_0_12px_rgba(239,68,68,0.15)]',   accent: 'bg-red-950/30',   labelColor: 'text-red-600/60',   valueGradient: 'from-red-500 to-red-300' },
  joker:     { border: 'border-purple-900/40', bg: 'from-[#0c0015] via-[#030010] to-[#000805]', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]', accent: 'bg-purple-900/20', labelColor: 'text-purple-500/60', valueGradient: 'from-purple-400 to-green-400' },
  generic:   { border: 'border-white/8',       bg: 'from-[#060610] via-[#040408] to-black',   glow: '',                                          accent: 'bg-white/5',       labelColor: 'text-white/40',      valueGradient: 'from-white to-white/80' },
};

const CHARACTER_EMOJIS: Record<HeroStatCardProps['character'], string> = {
  spider: '🕷️', batman: '🦇', naruto: '🍥', demon: '🌊', deathnote: '📓', joker: '🃏', generic: '⚡'
};

const HeroStatCard: React.FC<HeroStatCardProps> = ({ title, value, icon, desc, character, emoji }) => {
  const s = CHARACTER_STYLES[character];
  const charEmoji = emoji || CHARACTER_EMOJIS[character];

  return (
    <div className={`relative rounded-2xl border ${s.border} bg-gradient-to-br ${s.bg} ${s.glow} p-4 flex flex-col gap-3 group hover:scale-[1.02] transition-all duration-300 overflow-hidden`}>
      {/* Watermark character emoji */}
      <div className="absolute -top-1 -right-1 text-[52px] opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none select-none">
        {charEmoji}
      </div>

      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${s.labelColor}`} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`text-[8px] font-black uppercase tracking-widest ${s.labelColor} font-mono`}>{title}</span>
        <div className={`p-1.5 rounded-lg ${s.accent} text-white/60`}>{icon}</div>
      </div>

      {/* Value */}
      <div className={`text-2xl font-black bg-gradient-to-r ${s.valueGradient} bg-clip-text text-transparent leading-none`}>
        {value}
      </div>

      {/* Desc */}
      {desc && <p className="text-[9px] text-white/30 font-mono leading-tight">{desc}</p>}

      {/* Character badge */}
      <div className="flex items-center gap-1">
        <span className="text-[8px]">{charEmoji}</span>
        <span className="text-[7px] text-white/20 font-mono uppercase tracking-wider">{character === 'spider' ? 'Spider-Verse' : character === 'batman' ? 'Gotham' : character === 'naruto' ? 'Hidden Leaf' : character === 'demon' ? 'Slayer Corps' : character === 'deathnote' ? 'Dev Note' : character === 'joker' ? 'Chaos Div.' : 'Career OS'}</span>
      </div>
    </div>
  );
};

export const OverviewMetrics: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const projects = useCareerStore((s) => s.projects);
  const resume = useCareerStore((s) => s.resume);
  const applications = useCareerStore((s) => s.applications);
  const xp = useCareerStore((s) => s.xp);
  const level = useCareerStore((s) => s.level);
  const germanXP = useCareerStore((s) => s.germanXP);
  const germanStreak = useCareerStore((s) => s.germanStreak);
  const germanListeningMinutes = useCareerStore((s) => s.germanListeningMinutes);
  const germanLevel = useCareerStore((s) => s.germanLevel);

  const stateContext = { userProfile, dailyLogs, problemLogs, projects, resume, applications, level };

  const totalLc = getTotalLCSolved(stateContext);
  const skillrackCount = getActivityTotal(stateContext, 'skillrack');
  const aptitudeCount = getActivityTotal(stateContext, 'aptitude');
  const sqlCount = getActivityTotal(stateContext, 'sql');
  const completedDays = Object.values(dailyLogs).filter((l) => l.status === 'completed').length;
  const streak = getStreak({ userProfile, dailyLogs, problemLogs, projects, resume, applications, level, xp: 0 });

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🕷️</span>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">
            <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">Spider-Sense</span>
            <span className="text-white/60"> Metrics</span>
          </h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 via-blue-500/20 to-transparent" />
        <span className="text-[8px] text-white/25 font-mono uppercase tracking-widest">Overview Dashboard</span>
      </div>

      {/* Hero Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <HeroStatCard
          title="LeetCode Solved"
          value={totalLc}
          icon={<Code2 className="h-3.5 w-3.5" />}
          desc={`${totalLc}/360 web shots fired`}
          character="spider"
        />
        <HeroStatCard
          title="XP Level"
          value={`Lvl ${level}`}
          icon={<Trophy className="h-3.5 w-3.5" />}
          desc={`${xp} total XP earned`}
          character="naruto"
        />
        <HeroStatCard
          title="Days Completed"
          value={`${completedDays}/180`}
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          desc="Mission days logged"
          character="batman"
        />
        <HeroStatCard
          title="Current Streak"
          value={`${streak}d`}
          icon={<Flame className="h-3.5 w-3.5" />}
          desc="Consecutive active days"
          character="demon"
        />
        <HeroStatCard
          title="German XP"
          value={germanXP}
          icon={<Languages className="h-3.5 w-3.5" />}
          desc={germanLevel || 'A1 Beginner'}
          character="deathnote"
        />
        <HeroStatCard
          title="SkillRack"
          value={skillrackCount}
          icon={<Boxes className="h-3.5 w-3.5" />}
          desc="Speed coding reps"
          character="generic"
          emoji="⚙️"
        />
        <HeroStatCard
          title="Aptitude"
          value={aptitudeCount}
          icon={<Brain className="h-3.5 w-3.5" />}
          desc="Reasoning sessions"
          character="joker"
        />
        <HeroStatCard
          title="SQL Progress"
          value={sqlCount}
          icon={<Sigma className="h-3.5 w-3.5" />}
          desc="Database queries"
          character="generic"
          emoji="🔷"
        />
        <HeroStatCard
          title="German Streak"
          value={`${germanStreak}d`}
          icon={<Flame className="h-3.5 w-3.5" />}
          desc="Daily Duolingo streak"
          character="generic"
          emoji="🇩🇪"
        />
        <HeroStatCard
          title="Listening Min"
          value={germanListeningMinutes}
          icon={<Headphones className="h-3.5 w-3.5" />}
          desc="Audio practice minutes"
          character="generic"
          emoji="🎧"
        />
      </div>
    </div>
  );
};
