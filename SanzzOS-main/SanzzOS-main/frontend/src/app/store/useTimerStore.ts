import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'work' | 'short_break' | 'long_break';

interface TimerState {
  // Settings (user-configurable)
  workDuration: number;       // in seconds, default 25*60
  shortBreakDuration: number; // in seconds, default 5*60
  longBreakDuration: number;  // in seconds, default 15*60
  longBreakAfter: number;     // number of pomodoros before long break
  autoStart: boolean;
  alarmEnabled: boolean;
  alarmVolume: number;        // 0–1

  // Session state
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  pomodoroCount: number;      // how many work sessions completed today

  // Actions
  setWorkDuration: (s: number) => void;
  setShortBreakDuration: (s: number) => void;
  setLongBreakDuration: (s: number) => void;
  setLongBreakAfter: (n: number) => void;
  setAutoStart: (v: boolean) => void;
  setAlarmEnabled: (v: boolean) => void;
  setAlarmVolume: (v: number) => void;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchMode: (mode: TimerMode) => void;
  completeCycle: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      longBreakAfter: 4,
      autoStart: false,
      alarmEnabled: true,
      alarmVolume: 0.6,

      mode: 'work',
      secondsLeft: 25 * 60,
      isRunning: false,
      pomodoroCount: 0,

      setWorkDuration: (s) => set({ workDuration: s, secondsLeft: s, isRunning: false }),
      setShortBreakDuration: (s) => set({ shortBreakDuration: s }),
      setLongBreakDuration: (s) => set({ longBreakDuration: s }),
      setLongBreakAfter: (n) => set({ longBreakAfter: n }),
      setAutoStart: (v) => set({ autoStart: v }),
      setAlarmEnabled: (v) => set({ alarmEnabled: v }),
      setAlarmVolume: (v) => set({ alarmVolume: v }),

      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),

      reset: () => {
        const { mode, workDuration, shortBreakDuration, longBreakDuration } = get();
        const dur = mode === 'work' ? workDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;
        set({ secondsLeft: dur, isRunning: false });
      },

      tick: () => {
        const { secondsLeft, completeCycle } = get();
        if (secondsLeft <= 1) {
          completeCycle();
        } else {
          set({ secondsLeft: secondsLeft - 1 });
        }
      },

      switchMode: (mode) => {
        const { workDuration, shortBreakDuration, longBreakDuration, autoStart } = get();
        const dur = mode === 'work' ? workDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;
        set({ mode, secondsLeft: dur, isRunning: autoStart });
      },

      completeCycle: () => {
        const { mode, pomodoroCount, longBreakAfter, autoStart } = get();
        if (mode === 'work') {
          const newCount = pomodoroCount + 1;
          const nextMode: TimerMode = newCount % longBreakAfter === 0 ? 'long_break' : 'short_break';
          const { shortBreakDuration, longBreakDuration } = get();
          const dur = nextMode === 'long_break' ? longBreakDuration : shortBreakDuration;
          set({ pomodoroCount: newCount, mode: nextMode, secondsLeft: dur, isRunning: autoStart });
        } else {
          const { workDuration } = get();
          set({ mode: 'work', secondsLeft: workDuration, isRunning: autoStart });
        }
      },
    }),
    {
      name: 'sanju-timer-store',
      partialize: (s) => ({
        workDuration: s.workDuration,
        shortBreakDuration: s.shortBreakDuration,
        longBreakDuration: s.longBreakDuration,
        longBreakAfter: s.longBreakAfter,
        autoStart: s.autoStart,
        alarmEnabled: s.alarmEnabled,
        alarmVolume: s.alarmVolume,
      }),
    }
  )
);
