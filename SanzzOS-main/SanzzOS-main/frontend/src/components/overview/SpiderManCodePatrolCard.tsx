import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTotalLCSolved, getStreak } from '../../utils/xpUtils';

const SPIDER_QUOTES = [
  { text: "With great power comes great responsibility.", char: "Uncle Ben" },
  { text: "Whatever life holds in store for me, I will never forget these words — with great debugging comes great responsibility.", char: "Peter Parker (Dev Edition)" },
  { text: "I'm a friendly neighbourhood developer. I fix bugs before the city notices.", char: "Spider-Man" },
  { text: "The suit doesn't make the hero. The commits do.", char: "Miles Morales" },
  { text: "You can't run from who you are. You ARE the DSA grind.", char: "Spider-Man 2099" },
  { text: "Every expert was once a beginner who refused to give up on their LeetCode streak.", char: "Gwen Stacy" },
];

// Mini Spider-Web SVG decorative element
const WebCorner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    viewBox="0 0 80 80" 
    className={`absolute pointer-events-none ${className}`}
    style={{ opacity: 0.12 }}
  >
    {/* Web strand radials */}
    {[0, 30, 60, 90].map((angle) => (
      <line
        key={angle}
        x1="0" y1="0"
        x2={80 * Math.cos((angle * Math.PI) / 180)}
        y2={80 * Math.sin((angle * Math.PI) / 180)}
        stroke="#DC2626"
        strokeWidth="0.8"
      />
    ))}
    {/* Web arc rings */}
    {[20, 40, 60].map((r) => (
      <path
        key={r}
        d={`M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}`}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="0.6"
        strokeDasharray="4 2"
      />
    ))}
  </svg>
);

export const SpiderManCodePatrolCard: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [pulseShot, setPulseShot] = useState(false);

  const totalLC = getTotalLCSolved({ 
    dailyLogs: careerState.dailyLogs, 
    userProfile: careerState.userProfile,
    problemLogs: careerState.problemLogs
  });
  const streak = getStreak({ 
    dailyLogs: careerState.dailyLogs, 
    userProfile: careerState.userProfile 
  });

  // Get today's LC count
  const dailyLogs = careerState.dailyLogs;
  const todayLCCount = Object.values(dailyLogs).length > 0
    ? (Object.values(dailyLogs).slice(-1)[0]?.lcStatus?.length || 0)
    : 0;

  // Rotate quotes every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % SPIDER_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleWebShot = () => {
    setPulseShot(true);
    setTimeout(() => setPulseShot(false), 1000);
  };

  return (
    <Card className="relative overflow-hidden border-[#1a0505] bg-gradient-to-br from-[#150005] via-[#07000f] to-black p-5 shadow-glow-spider transition duration-300 hover:border-red-800/40 group select-none">
      {/* Decorative web corners */}
      <WebCorner className="top-0 left-0 w-20 h-20" />
      <WebCorner className="bottom-0 right-0 w-20 h-20 rotate-180" />

      {/* Top label */}
      <div className="flex items-center justify-between mb-4 border-b border-red-950/50 pb-3">
        <div>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500 font-mono">Spider-Verse Code Patrol</span>
          <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
            🕷️ <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">WEB SHOT</span> LOG
          </h3>
        </div>
        <button
          type="button"
          onClick={handleWebShot}
          className={`text-[18px] transition duration-200 ${pulseShot ? 'scale-125 drop-shadow-[0_0_12px_rgba(220,38,38,0.9)]' : 'hover:scale-110'}`}
          title="Shoot a web!"
        >
          🕸️
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-red-950/25 border border-red-900/30 p-2.5 text-center">
          <div className="text-xs font-black text-red-400 font-mono">{todayLCCount}</div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider mt-0.5">Today's Shots</div>
        </div>
        <div className="rounded-xl bg-blue-950/25 border border-blue-900/30 p-2.5 text-center">
          <div className="text-xs font-black text-blue-400 font-mono">{totalLC}</div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider mt-0.5">Total Webs</div>
        </div>
        <div className="rounded-xl bg-purple-950/25 border border-purple-900/30 p-2.5 text-center">
          <div className="text-xs font-black text-purple-400 font-mono">{streak}d</div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider mt-0.5">Streak</div>
        </div>
      </div>

      {/* Web animation progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-red-500/60 font-mono">Web Fluid Level</span>
          <span className="text-[9px] text-white/40 font-mono">{Math.min(totalLC, 360)} / 360</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-400 to-blue-500 transition-all duration-1000"
            style={{ width: `${Math.min((totalLC / 360) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Quote */}
      <div className="pt-3 border-t border-red-950/30">
        <p className="text-[10px] italic text-white/70 leading-relaxed">"{SPIDER_QUOTES[quoteIdx].text}"</p>
        <span className="text-[8px] text-red-500/60 font-bold font-mono uppercase tracking-widest mt-1 block">
          — {SPIDER_QUOTES[quoteIdx].char}
        </span>
      </div>
    </Card>
  );
};
