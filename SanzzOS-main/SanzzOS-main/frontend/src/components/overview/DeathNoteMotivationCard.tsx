import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay } from '../../utils/dateUtils';
import { Flame } from 'lucide-react';

const ANIME_QUOTES = [
  { text: "The developer whose task is written in this note SHALL execute it.", char: "Rules of the Dev Note", anime: "Death Note" },
  { text: "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be!", char: "Naruto Uzumaki", anime: "Naruto" },
  { text: "No matter how many test cases fail, you have no choice but to go on debugging. Set your heart ablaze!", char: "Kyojuro Rengoku", anime: "Demon Slayer" },
  { text: "No matter how gifted you are, you alone cannot change the world. Write down your next action and build it.", char: "L Lawliet", anime: "Death Note" },
  { text: "I'm not gonna run away, I never go back on my word! That's my nindo, my developer way!", char: "Naruto Uzumaki", anime: "Naruto" },
  { text: "I will look for the bugs. I will find them, and I will fix them. Because that is what a ninja developer does.", char: "Sasuke Uchiha", anime: "Naruto" },
  { text: "Feel the pain, contemplate the pain, accept the pain, know the pain. Those who do not know pain will never understand true coding.", char: "Pain", anime: "Naruto" }
];

export const DeathNoteMotivationCard: React.FC = () => {
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const awardXP = useCareerStore((s) => s.awardXP);
  const startDate = useCareerStore((s) => s.userProfile.startDate);
  
  const [taskName, setTaskName] = useState('');
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [successAnim, setSuccessAnim] = useState(false);

  const activeQuote = ANIME_QUOTES[activeQuoteIndex];

  // Play creepy arpeggio sound using Web Audio API
  const playDeathNoteChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playNote(554.37, now, 0.4);       // C#5
      playNote(523.25, now + 0.35, 0.6);  // C5
      playNote(415.30, now + 0.7, 0.8);   // G#4
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  const handleWriteTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    // Add task to daily log
    const todayDay = getTodayDay(startDate);
    updateDailyLog(todayDay, {
      note: `[Death Note Task] ${taskName}`
    });

    awardXP(50);
    playDeathNoteChime();
    setSuccessAnim(true);
    setTimeout(() => {
      setSuccessAnim(false);
      setTaskName('');
    }, 1500);
  };

  const handleNextQuote = () => {
    setActiveQuoteIndex((prev) => (prev + 1) % ANIME_QUOTES.length);
  };

  return (
    <Card className="relative flex flex-col justify-between overflow-hidden border-[#3f0f0f] bg-gradient-to-br from-[#120505] via-[#050000] to-black p-5 shadow-2xl transition duration-300 hover:border-red-600/40 group">
      {/* Decorative dark background details */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition duration-500 text-red-600 font-serif text-[120px] pointer-events-none select-none">
        L
      </div>

      <div className="flex items-center justify-between border-b border-[#3d1111] pb-3 mb-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 font-serif">DEVELOPER'S REGISTER</span>
          <h3 className="text-xl font-bold tracking-widest text-white mt-1 font-serif select-none">DEATH NOTE</h3>
        </div>
        <button 
          onClick={playDeathNoteChime}
          className="p-1.5 rounded-full border border-red-950 bg-red-950/20 text-red-500 hover:bg-red-950/50 hover:text-red-400 transition"
          type="button"
          title="Click to hear the Ryuk chime"
        >
          <Flame className="h-4 w-4" />
        </button>
      </div>

      {/* Quote Display Area */}
      <div className="py-2 min-h-[90px] flex flex-col justify-center">
        <p className="text-sm font-serif italic text-red-100/90 leading-relaxed">
          "{activeQuote.text}"
        </p>
        <span className="mt-2 text-[10px] uppercase font-bold text-red-500/70 tracking-wider self-end font-serif">
          — {activeQuote.char} ({activeQuote.anime})
        </span>
      </div>

      {/* Writing form inside Death Note */}
      <form onSubmit={handleWriteTask} className="mt-4 flex flex-col gap-2 relative">
        <label className="text-[8px] uppercase tracking-widest text-white/50 font-serif">
          Write a daily task here to seal its completion:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. Solve binary search tree deletion..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="flex-1 rounded-lg border border-[#381a1a] bg-black/85 px-3 py-2 text-xs font-serif text-white placeholder-white/20 focus:border-red-600 focus:outline-none transition"
          />
          <button
            type="submit"
            className="rounded-lg bg-red-800 px-4 py-2 text-xs font-serif font-black text-white hover:bg-red-700 active:scale-95 transition"
          >
            Write
          </button>
        </div>

        {/* Dynamic Success ink drop animation */}
        {successAnim && (
          <div className="absolute inset-0 bg-[#0e0303]/90 rounded-lg flex items-center justify-center text-red-500 font-serif text-xs font-bold tracking-widest animate-pulse border border-red-900/50">
            🩸 TASK SEALED IN THE NOTE...
          </div>
        )}
      </form>

      <div className="mt-4 flex items-center justify-between border-t border-[#3d1111] pt-3 text-[9px] text-white/40">
        <span>Gains +50 XP upon resolution</span>
        <button
          type="button"
          onClick={handleNextQuote}
          className="text-red-500 hover:text-red-400 font-bold uppercase font-serif tracking-widest hover:underline"
        >
          Next Rule
        </button>
      </div>
    </Card>
  );
};
