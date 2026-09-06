import React, { useState, useEffect } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';
import { Save, CloudLightning, Bot, Layout } from 'lucide-react';
import { awardXPForLog, getLevel } from '../../utils/xpUtils';
import { CinematicUniverse } from '../visual/CinematicUniverseOverlay';

const THEMES: Record<CinematicUniverse, {
  border: string;
  glow: string;
  buttonHover: string;
  saveBtn: string;
  accentText: string;
  iconColor: string;
}> = {
  'spider-verse': {
    border: 'border-pink-500/50',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.35)]',
    buttonHover: 'hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/40 border-transparent',
    saveBtn: 'bg-pink-500 hover:bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)]',
    accentText: 'text-pink-400',
    iconColor: 'text-cyan-400'
  },
  'batman': {
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.35)]',
    buttonHover: 'hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/40 border-transparent',
    saveBtn: 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-[0_0_12px_rgba(234,179,8,0.6)] font-extrabold',
    accentText: 'text-yellow-400',
    iconColor: 'text-cyan-400'
  },
  'joker': {
    border: 'border-green-500/50',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.35)]',
    buttonHover: 'hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/40 border-transparent',
    saveBtn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    accentText: 'text-green-400',
    iconColor: 'text-purple-400'
  },
  'anime': {
    border: 'border-red-500/50',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
    buttonHover: 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 border-transparent',
    saveBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    accentText: 'text-red-400',
    iconColor: 'text-orange-400'
  }
};

export const FloatingActions: React.FC = () => {
  const { dailyLogs, updateDailyLog } = useCareerStore();
  const setCareerState = useCareerStore.setState;
  const { setActiveSection, currentDay } = useUIStore();

  const [saving, setSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [universe, setUniverse] = useState<CinematicUniverse>('spider-verse');

  useEffect(() => {
    // Read initial theme
    const initialTheme = document.documentElement.getAttribute('data-cinematic-theme') as CinematicUniverse;
    if (initialTheme) {
      setUniverse(initialTheme);
    }

    // Event listener for theme changes
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<CinematicUniverse>;
      setUniverse(customEvent.detail);
    };

    window.addEventListener('cinematic-theme-changed', handleThemeChange);
    return () => window.removeEventListener('cinematic-theme-changed', handleThemeChange);
  }, []);

  const handleSaveToday = () => {
    setSaving(true);
    const todayLog = dailyLogs[currentDay] || {
      counts: { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 },
      lcStatus: [],
      note: '',
      mood: 3,
      energy: 3,
      distractions: 0,
      focusMinutes: 0,
      status: 'not_started',
      savedAt: '',
      xpEarned: 0
    };

    // Calculate XP
    const earnedXP = awardXPForLog(currentDay, todayLog);
    const previousXPForDay = todayLog.xpEarned || 0;
    const xpDelta = earnedXP - previousXPForDay;
    updateDailyLog(currentDay, {
      xpEarned: earnedXP,
      savedAt: new Date().toISOString()
    });

    if (xpDelta !== 0) {
      setCareerState((state) => {
        const newXP = Math.max(0, (state.xp || 0) + xpDelta);
        const newLvl = getLevel(newXP);
        return {
          xp: newXP,
          level: newLvl.level
        };
      });
    }

    setTimeout(() => {
      setSaving(false);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2000);
    }, 600);
  };

  const handleBackup = () => {
    const stateData = useCareerStore.getState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sanju-career-os-backup-${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const themeStyle = THEMES[universe] || THEMES['spider-verse'];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 md:bottom-8 md:right-8 transition-all duration-500">
      {showSavedMsg && (
        <div className={`rounded-xl border px-3 py-2 text-xs font-bold text-white animate-bounce ${themeStyle.saveBtn}`}>
          ✓ Save Complete!
        </div>
      )}
      
      {/* Sleek, cinematic glassmorphic control deck bar */}
      <div className={`flex gap-2.5 bg-black/85 backdrop-blur-xl border p-2 rounded-2xl flex-wrap md:flex-nowrap justify-end max-w-[280px] md:max-w-none transition-all duration-500 ${themeStyle.border} ${themeStyle.glow}`}>
        <button
          onClick={() => setActiveSection('today')}
          title="Open Today"
          className={`flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/5 text-textSecondary border transition duration-300 ${themeStyle.buttonHover}`}
        >
          <Layout className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={() => { setActiveSection('ai'); }}
          title="Ask Shayla"
          className={`flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/5 border transition duration-300 ${themeStyle.iconColor} ${themeStyle.buttonHover}`}
        >
          <Bot className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={handleBackup}
          title="Backup JSON"
          className={`flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/5 text-textSecondary border transition duration-300 ${themeStyle.buttonHover}`}
        >
          <CloudLightning className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={handleSaveToday}
          disabled={saving}
          title="Save Today"
          className={`flex h-9.5 px-4 items-center justify-center gap-1.5 rounded-xl font-bold text-xs transition duration-300 hover:scale-102 ${themeStyle.saveBtn}`}
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};
export default FloatingActions;
