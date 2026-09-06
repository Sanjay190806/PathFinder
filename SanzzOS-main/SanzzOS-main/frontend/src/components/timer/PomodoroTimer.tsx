import React, { useEffect, useRef, useState } from 'react';
import { useTimerStore, TimerMode } from '../../app/store/useTimerStore';
import { playGong, playChime, playWarningPulse } from '../../utils/timerSounds';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const MODE_LABEL: Record<TimerMode, string> = {
  work: '🕷️ FOCUS',
  short_break: '❄️ SHORT BREAK',
  long_break: '🍥 LONG BREAK',
};

const MODE_COLOR: Record<TimerMode, { ring: string; bg: string; text: string; glow: string }> = {
  work:        { ring: 'stroke-red-500',    bg: 'from-red-950/40 to-black',    text: 'text-red-400',    glow: 'shadow-[0_0_30px_rgba(220,38,38,0.3)]' },
  short_break: { ring: 'stroke-cyan-400',   bg: 'from-cyan-950/40 to-black',   text: 'text-cyan-400',   glow: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]' },
  long_break:  { ring: 'stroke-orange-400', bg: 'from-orange-950/40 to-black', text: 'text-orange-400', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]' },
};

// ── Settings Modal ────────────────────────────────────────────────────────────
const TimerSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    workDuration, shortBreakDuration, longBreakDuration, longBreakAfter,
    autoStart, alarmEnabled, alarmVolume,
    setWorkDuration, setShortBreakDuration, setLongBreakDuration,
    setLongBreakAfter, setAutoStart, setAlarmEnabled, setAlarmVolume,
  } = useTimerStore();

  const slider = (label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, unit = 'min') => (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 font-mono">{label}</span>
        <span className="text-xs font-black text-white/80">{unit === 'min' ? `${Math.round(value / 60)} min` : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#a855f7' }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-purple-500/20 p-6 flex flex-col gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(15,0,30,0.98), rgba(5,5,15,0.98))' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white tracking-tight">⚙️ Timer Settings</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          {slider('Focus Duration', workDuration, 5*60, 120*60, 60, setWorkDuration)}
          {slider('Short Break', shortBreakDuration, 60, 30*60, 60, setShortBreakDuration)}
          {slider('Long Break', longBreakDuration, 5*60, 60*60, 60, setLongBreakDuration)}
          {slider('Long Break After', longBreakAfter, 2, 8, 1, setLongBreakAfter, 'sessions')}

          <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
            {/* Toggle row */}
            {([
              ['Auto-start next session', autoStart, setAutoStart],
              ['Alarm sound enabled', alarmEnabled, setAlarmEnabled],
            ] as [string, boolean, (v: boolean) => void][]).map(([label, val, setter]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 font-mono">{label}</span>
                <button
                  onClick={() => setter(!val)}
                  className={`w-9 h-5 rounded-full transition-all duration-200 relative ${val ? 'bg-purple-500' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${val ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
            ))}

            {alarmEnabled && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 font-mono">Alarm Volume</span>
                  <span className="text-xs font-black text-white/80">{Math.round(alarmVolume * 100)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.05} value={alarmVolume}
                  onChange={e => setAlarmVolume(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: '#a855f7' }} />
              </div>
            )}
          </div>
        </div>

        <button onClick={onClose} className="mt-1 w-full py-2 rounded-xl text-xs font-black text-white tracking-wider transition"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(34,197,94,0.2))', border: '1px solid rgba(168,85,247,0.3)' }}>
          Save &amp; Close
        </button>
      </div>
    </div>
  );
};

interface PomodoroTimerProps {
  onWorkSessionComplete?: (minutes: number) => void;
}

// ── Main Timer Component ───────────────────────────────────────────────────────
export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onWorkSessionComplete }) => {
  const {
    mode, secondsLeft, isRunning, pomodoroCount,
    workDuration, shortBreakDuration, longBreakDuration, longBreakAfter,
    alarmEnabled, alarmVolume,
    start, pause, reset, tick, switchMode,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warned5Ref = useRef(false);
  const completedWorkCountRef = useRef(pomodoroCount);
  const [showSettings, setShowSettings] = useState(false);

  const totalDuration = mode === 'work' ? workDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;
  const progress = 1 - secondsLeft / totalDuration;
  const c = MODE_COLOR[mode];

  // ── Tick ──
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  // ── 5-min warning + alarm on done ──
  useEffect(() => {
    if (!alarmEnabled) { warned5Ref.current = false; return; }
    if (secondsLeft === 300 && isRunning && !warned5Ref.current) {
      warned5Ref.current = true;
      playWarningPulse(alarmVolume);
    }
    if (secondsLeft === 0) {
      warned5Ref.current = false;
      playGong(alarmVolume);
    }
  }, [secondsLeft, isRunning, alarmEnabled, alarmVolume]);

  // Reset warning flag when mode changes
  useEffect(() => { warned5Ref.current = false; }, [mode]);

  useEffect(() => {
    if (pomodoroCount > completedWorkCountRef.current) {
      onWorkSessionComplete?.(Math.round(workDuration / 60));
    }
    completedWorkCountRef.current = pomodoroCount;
  }, [pomodoroCount, workDuration, onWorkSessionComplete]);

  // ── SVG ring ──
  const RADIUS = 70;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <>
      {showSettings && <TimerSettings onClose={() => setShowSettings(false)} />}

      <div className={`relative rounded-3xl border border-white/8 overflow-hidden flex flex-col items-center gap-4 p-5 bg-gradient-to-br ${c.bg} ${c.glow} transition-all duration-500`}>
        {/* Scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%)', backgroundSize: '100% 3px' }} />

        {/* Mode tabs */}
        <div className="flex gap-1 w-full">
          {(['work', 'short_break', 'long_break'] as TimerMode[]).map(m => (
            <button
              key={m}
              onClick={() => { pause(); switchMode(m); }}
              className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest font-mono transition ${
                mode === m ? 'bg-white/10 text-white border border-white/15' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>

        {/* Ring timer */}
        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <svg width="180" height="180" className="rotate-[-90deg] absolute">
            <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="90" cy="90" r={RADIUS}
              fill="none"
              className={c.ring}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 6px currentColor)` }}
            />
          </svg>

          {/* Center display */}
          <div className="flex flex-col items-center gap-1 z-10">
            <span className={`text-4xl font-black tracking-tight ${c.text} font-mono`} style={{ textShadow: '0 0 20px currentColor' }}>
              {fmt(secondsLeft)}
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 font-mono">
              {secondsLeft <= 300 && isRunning ? '⚠️ FINAL 5 MIN' : MODE_LABEL[mode]}
            </span>
          </div>
        </div>

        {/* Pomodoro dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: longBreakAfter }).map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i < (pomodoroCount % longBreakAfter)
                ? 'bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.6)]'
                : 'bg-white/10'
            }`} />
          ))}
          <span className="text-[8px] text-white/30 font-mono ml-1">{pomodoroCount} done</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={isRunning ? pause : start}
            className="flex-1 py-2.5 rounded-xl font-black text-sm tracking-wider transition active:scale-95"
            style={{
              background: isRunning
                ? 'rgba(239,68,68,0.2)'
                : 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(34,197,94,0.2))',
              border: `1px solid ${isRunning ? 'rgba(239,68,68,0.4)' : 'rgba(168,85,247,0.4)'}`,
              color: isRunning ? '#f87171' : '#c084fc',
              boxShadow: isRunning ? '0 0 12px rgba(239,68,68,0.2)' : '0 0 12px rgba(168,85,247,0.2)',
            }}
          >
            {isRunning ? '⏸ PAUSE' : '▶ START'}
          </button>
          <button
            onClick={() => { pause(); reset(); }}
            className="py-2.5 px-3.5 rounded-xl text-white/30 hover:text-white/70 transition border border-white/5 hover:border-white/15"
          >
            ↺
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="py-2.5 px-3.5 rounded-xl text-white/30 hover:text-purple-400 transition border border-white/5 hover:border-purple-500/20"
          >
            ⚙️
          </button>
        </div>

        {/* Test alarm button (dev helper) */}
        <button
          onClick={() => playChime(alarmEnabled ? alarmVolume : 0.5)}
          className="text-[8px] text-white/15 hover:text-white/40 font-mono transition"
        >
          🔔 test alarm
        </button>
      </div>
    </>
  );
};
