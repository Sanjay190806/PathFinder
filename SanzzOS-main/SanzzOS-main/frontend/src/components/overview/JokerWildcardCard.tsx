import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';

const JOKER_QUOTES = [
  { text: "Why so serious? It's just a runtime error.", char: "The Joker" },
  { text: "Introduce a little chaos into your code. Upset the established order, and everything becomes — a bug.", char: "The Joker" },
  { text: "Do I really look like a guy with a plan? I'm a developer. I have no plan.", char: "The Joker" },
  { text: "You know what I noticed? Nobody panics when things go according to plan... even if the plan is to fail your LeetCode.", char: "The Joker" },
  { text: "Madness, as you know, is like gravity. All it takes is a little push... of a commit.", char: "The Joker" },
  { text: "They laugh at me because I'm different. I laugh at them because they haven't solved a hard DP problem yet.", char: "The Joker" },
  { text: "I'm not a monster. I'm just ahead of the curve.", char: "The Joker" },
];

const CHAOS_EMOJIS = ['🃏', '🎭', '♠️', '♦️', '♣️', '🎪', '🎲'];

const PlayingCard: React.FC<{ symbol: string; onClick: () => void }> = ({ symbol, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-9 h-12 rounded-lg bg-gradient-to-br from-purple-950 to-green-950 border border-purple-600/30 flex items-center justify-center text-base hover:scale-110 hover:border-green-400/40 transition-all duration-200 animate-chaos-bounce shadow-glow-joker"
    style={{ animationDelay: `${Math.random() * 2}s` }}
  >
    {symbol}
  </button>
);

export const JokerWildcardCard: React.FC = () => {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [emojiIdx, setEmojiIdx] = useState(0);
  const [glitching, setGlitching] = useState(false);

  const careerState = useCareerStore((s) => s);
  const mood = Object.values(careerState.dailyLogs).length > 0
    ? (Object.values(careerState.dailyLogs).slice(-1)[0]?.mood || 5)
    : 5;
  const energy = Object.values(careerState.dailyLogs).length > 0
    ? (Object.values(careerState.dailyLogs).slice(-1)[0]?.energy || 5)
    : 5;
  
  const getMoodLabel = (m: number) => {
    if (m >= 8) return { text: 'MANIACAL', color: 'text-green-400' };
    if (m >= 6) return { text: 'ERRATIC', color: 'text-purple-400' };
    if (m >= 4) return { text: 'UNSTABLE', color: 'text-yellow-500' };
    return { text: 'GRIM', color: 'text-red-500' };
  };
  const moodLabel = getMoodLabel(mood);

  // Random quote & emoji rotation
  useEffect(() => {
    const qInterval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % JOKER_QUOTES.length);
    }, 5000);
    const eInterval = setInterval(() => {
      setEmojiIdx((prev) => (prev + 1) % CHAOS_EMOJIS.length);
    }, 1800);
    return () => { clearInterval(qInterval); clearInterval(eInterval); };
  }, []);

  const triggerGlitch = () => {
    setGlitching(true);
    setQuoteIdx(Math.floor(Math.random() * JOKER_QUOTES.length));
    setTimeout(() => setGlitching(false), 600);
  };

  return (
    <Card className="relative overflow-hidden border-purple-950/50 bg-gradient-to-br from-[#0b0012] via-[#050010] to-[#000805] p-5 shadow-glow-joker transition duration-300 hover:border-purple-700/30 group select-none">
      {/* Diagonal stripe background */}
      <div className="joker-chaos-bg absolute inset-0" />

      {/* Floating card suits */}
      <div className="absolute top-2 right-12 text-[10px] text-purple-800 opacity-20 animate-chaos-bounce" style={{ animationDelay: '0.5s' }}>♦</div>
      <div className="absolute top-8 right-6 text-[10px] text-green-800 opacity-20 animate-chaos-bounce" style={{ animationDelay: '1.2s' }}>♣</div>
      <div className="absolute bottom-8 left-3 text-[12px] text-purple-700 opacity-15 animate-chaos-bounce" style={{ animationDelay: '0.8s' }}>♠</div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 border-b border-purple-950/60 pb-3 relative">
        <div>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400/70 font-mono animate-joker-flicker">
            Chaos Division — Wildcard
          </span>
          <h3 className={`text-lg font-black mt-0.5 tracking-tight transition-all duration-200 ${glitching ? 'animate-joker-glitch' : ''}`}>
            🃏 <span className="animate-joker-flicker text-purple-400">JOKER'S</span>{' '}
            <span className="text-green-400">DEAL</span>
          </h3>
        </div>
        <button
          type="button"
          onClick={triggerGlitch}
          className="text-2xl hover:scale-125 transition-transform duration-200 animate-chaos-bounce"
          title="Deal a new card!"
        >
          {CHAOS_EMOJIS[emojiIdx]}
        </button>
      </div>

      {/* Mood & Energy */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-purple-950/20 border border-purple-900/25 p-2.5">
          <div className={`text-sm font-black font-mono ${moodLabel.color}`}>{moodLabel.text}</div>
          <div className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5">Today's Mood</div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-green-500 transition-all duration-1000"
              style={{ width: `${mood * 10}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-green-950/20 border border-green-900/25 p-2.5">
          <div className="text-sm font-black font-mono text-green-400">{energy}/10</div>
          <div className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5">Chaos Energy</div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-300 transition-all duration-1000"
              style={{ width: `${energy * 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Hand */}
      <div className="flex items-center gap-2 mb-4">
        {['♠️', '🃏', '♦️'].map((s, i) => (
          <PlayingCard key={i} symbol={s} onClick={triggerGlitch} />
        ))}
        <div className="ml-2 text-[8px] text-purple-500/50 font-mono uppercase tracking-widest leading-relaxed">
          Click a card<br />for a new<br />Joker quote!
        </div>
      </div>

      {/* Joker Quote */}
      <div className={`pt-3 border-t border-purple-950/40 transition-all duration-200 ${glitching ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-[10px] italic text-white/70 leading-relaxed animate-joker-glitch">
          "{JOKER_QUOTES[quoteIdx].text}"
        </p>
        <span className="text-[8px] animate-joker-flicker font-bold font-mono uppercase tracking-widest mt-1 block">
          — {JOKER_QUOTES[quoteIdx].char}
        </span>
      </div>
    </Card>
  );
};
