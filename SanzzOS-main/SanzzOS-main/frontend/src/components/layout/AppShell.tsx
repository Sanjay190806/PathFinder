import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { AchievementToast } from '../achievements/AchievementToast';
import { CommandPalette } from '../navigation/CommandPalette';
import { ShaylaLauncher } from '../ai/ShaylaLauncher';
import { NeonAtmosphere } from './NeonAtmosphere';
import { CursorAura } from './CursorAura';
import { ImmersiveBackground } from '../visual/ImmersiveBackground';
import { CinematicUniverseOverlay } from '../visual/CinematicUniverseOverlay';
import { FloatingActions } from '../ui/FloatingActions';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';
import { useThemePreset } from '../../hooks/useThemePreset';
import { awardXPForLog, getLevel } from '../../utils/xpUtils';
import { getTodayDay } from '../../utils/dateUtils';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  useThemePreset();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );

      // Ctrl + S (Save Day) -> Allowed even when typing!
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !event.shiftKey) {
        event.preventDefault();
        const store = useCareerStore.getState();
        const currentDay = useUIStore.getState().currentDay;
        const currentLog = store.dailyLogs[currentDay] || {
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
        const earned = awardXPForLog(currentDay, currentLog);
        store.updateDailyLog(currentDay, { xpEarned: earned, savedAt: new Date().toISOString() });
        
        const newXP = store.xp + earned;
        useCareerStore.setState({ xp: newXP, level: getLevel(newXP).level });
        
        // Show a temporary alert or custom UI event
        const notifier = document.createElement('div');
        notifier.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-accentEmerald border border-accentEmerald/20 px-4 py-2.5 rounded-xl text-xs font-bold text-white z-50 shadow-glow-emerald";
        notifier.innerText = `✓ Saved Day ${currentDay}! Streak Protected. +${earned} XP`;
        document.body.appendChild(notifier);
        setTimeout(() => notifier.remove(), 2500);
      }

      if (isTyping) {
        if (event.key === 'Escape') {
          (activeEl as HTMLElement).blur();
        }
        return; // Do not intercept other shortcut keys while typing
      }

      // Ctrl + Left (Previous Day)
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
        event.preventDefault();
        const uiStore = useUIStore.getState();
        uiStore.setCurrentDay(Math.max(uiStore.currentDay - 1, 1));
      }

      // Ctrl + Right (Next Day)
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
        event.preventDefault();
        const uiStore = useUIStore.getState();
        uiStore.setCurrentDay(Math.min(uiStore.currentDay + 1, 184)); // 184 max days
      }

      // Ctrl + T (Jump to Today)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
        event.preventDefault();
        const start = useCareerStore.getState().userProfile.startDate;
        useUIStore.getState().setCurrentDay(getTodayDay(start));
      }

      // Ctrl + B (Open Daily Briefing / AI section)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        useUIStore.getState().setActiveSection('ai');
      }

      // Ctrl + Shift + S (Export Backup)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        const stateData = useCareerStore.getState();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateData));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `sanju-career-os-backup-${new Date().toISOString().substring(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="app-shell relative isolate text-textPrimary">
      <ImmersiveBackground />
      <NeonAtmosphere />
      <CursorAura />
      <CinematicUniverseOverlay />
      <Sidebar />
      <div className="shell-main">
        <Topbar onOpenCommandPalette={() => setCommandOpen(true)} />
        <main className="workspace-area">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <AchievementToast />
      <ShaylaLauncher />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <FloatingActions />
    </div>
  );
};
