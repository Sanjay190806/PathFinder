import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getStreak } from '../../utils/xpUtils';

const BATMAN_QUOTES = [
  { text: "It's not who I am underneath, but what I do in my daily commits that defines me.", char: "Bruce Wayne" },
  { text: "I'm not wearing hockey pads. I'm wearing a debugger.", char: "Batman" },
  { text: "A bat is only as good as its discipline. Show up every day, no exceptions.", char: "Bruce Wayne" },
  { text: "Why do we fall? So we can learn to fix the bug the next time.", char: "Alfred Pennyworth" },
  { text: "I have everything except the placement offer. That I must earn.", char: "Bruce Wayne" },
  { text: "The night is darkest just before the compile succeeds.", char: "Batman Begins" },
  { text: "Endure, Master Wayne. Take it. They'll hate you for it, but that's the point.", char: "Alfred" },
];

// Bat Signal SVG
const BatSignal: React.FC<{ streak: number }> = ({ streak }) => (
  <div className="relative flex items-center justify-center">
    {/* Outer glow ring */}
    <div 
      className="absolute rounded-full border-2 animate-bat-signal"
      style={{
        width: 64,
        height: 64,
        borderColor: 'rgba(234, 179, 8, 0.5)',
        boxShadow: '0 0 20px rgba(234, 179, 8, 0.3), 0 0 40px rgba(234, 179, 8, 0.1)'
      }}
    />
    {/* Inner circle */}
    <div 
      className="relative rounded-full bg-gradient-to-br from-yellow-900/40 to-yellow-950/60 border border-yellow-600/40 flex items-center justify-center"
      style={{ width: 52, height: 52 }}
    >
      <div className="text-center">
        <div className="text-base font-black text-yellow-400 leading-none font-mono">{streak}</div>
        <div className="text-[6px] text-yellow-600 uppercase font-bold tracking-wider">days</div>
      </div>
    </div>
    {/* Bat emoji overlay */}
    <div className="absolute -top-1 -right-1 text-[10px]">🦇</div>
  </div>
);

export const BatmanDisciplineCard: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const xp = useCareerStore((s) => s.xp);
  const level = useCareerStore((s) => s.level);

  const streak = getStreak({ 
    dailyLogs: careerState.dailyLogs, 
    userProfile: careerState.userProfile 
  });

  const completedDays = Object.values(careerState.dailyLogs).filter(
    (l) => l.status === 'completed' || l.completionType === 'perfect'
  ).length;

  // Rotate quotes every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % BATMAN_QUOTES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative overflow-hidden border-[#1a1400] bg-gradient-to-br from-[#0d0a00] via-[#05050a] to-black p-5 shadow-glow-batman transition duration-300 hover:border-yellow-900/50 group select-none">
      {/* Gotham city line silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-12 opacity-[0.04] pointer-events-none overflow-hidden">
        <svg viewBox="0 0 200 50" className="w-full h-full" preserveAspectRatio="none">
          <path 
            d="M0,50 L0,30 L10,30 L10,15 L15,15 L15,25 L20,25 L20,10 L25,10 L25,5 L30,5 L30,10 L35,10 L35,20 L45,20 L45,8 L50,8 L50,20 L60,20 L60,15 L65,15 L65,20 L75,20 L75,5 L80,5 L80,0 L85,0 L85,5 L90,5 L90,20 L100,20 L100,10 L105,10 L105,20 L115,20 L115,25 L120,25 L120,15 L130,15 L130,20 L140,20 L140,8 L145,8 L145,20 L155,20 L155,12 L160,12 L160,20 L170,20 L170,25 L180,25 L180,15 L185,15 L185,25 L195,25 L195,30 L200,30 L200,50 Z"
            fill="#EAB308"
          />
        </svg>
      </div>

      {/* Faint batman logo watermark */}
      <div className="absolute top-3 right-3 text-[60px] opacity-[0.03] pointer-events-none select-none rotate-12">
        🦇
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 border-b border-yellow-950/40 pb-3">
        <div>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow-600/80 font-mono">Gotham Discipline Core</span>
          <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
            🦇 <span className="text-yellow-400">DARK</span> <span className="text-white/80">STREAK</span>
          </h3>
        </div>
        <BatSignal streak={streak} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="rounded-xl bg-yellow-950/20 border border-yellow-900/20 p-2 text-center">
          <div className="text-sm font-black text-yellow-500 font-mono">{completedDays}</div>
          <div className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5">Perfect Days</div>
        </div>
        <div className="rounded-xl bg-yellow-950/20 border border-yellow-900/20 p-2 text-center">
          <div className="text-sm font-black text-yellow-500 font-mono">Lvl {level}</div>
          <div className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5">Vigilante Tier</div>
        </div>
        <div className="rounded-xl bg-yellow-950/20 border border-yellow-900/20 p-2 text-center">
          <div className="text-sm font-black text-yellow-500 font-mono">{xp}</div>
          <div className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5">Dark XP</div>
        </div>
      </div>

      {/* Streak bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-600/60 font-mono">Batman Protocol</span>
          <span className="text-[9px] text-white/40 font-mono">{streak} / 180 days</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-yellow-900 via-yellow-500 to-yellow-300 transition-all duration-1000"
            style={{ width: `${Math.min((streak / 180) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Quote */}
      <div className="pt-3 border-t border-yellow-950/30">
        <p className="text-[10px] italic text-white/70 leading-relaxed">"{BATMAN_QUOTES[quoteIdx].text}"</p>
        <span className="text-[8px] text-yellow-600/60 font-bold font-mono uppercase tracking-widest mt-1 block">
          — {BATMAN_QUOTES[quoteIdx].char}
        </span>
      </div>
    </Card>
  );
};
