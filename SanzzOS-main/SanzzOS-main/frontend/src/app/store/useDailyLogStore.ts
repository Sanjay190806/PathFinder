import { create } from 'zustand';
import { DailyLog } from '../../types';
import { useCareerStore } from './useCareerStore';
import { useUIStore } from './useUIStore';

const SELECTED_DAY_KEY = 'sanzz_os_selected_day_v1';

const readSelectedDay = () => {
  if (typeof window === 'undefined') return 1;
  const parsed = Number(window.localStorage.getItem(SELECTED_DAY_KEY));
  return Number.isFinite(parsed) && parsed >= 1 ? Math.min(Math.floor(parsed), 180) : 1;
};

const persistSelectedDay = (selectedDay: number) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SELECTED_DAY_KEY, String(selectedDay));
};

interface DailyLogStoreState {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  saveLog: (day: number, log: Partial<DailyLog>) => void;
}

export const useDailyLogStore = create<DailyLogStoreState>((set) => ({
  selectedDay: readSelectedDay(),
  setSelectedDay: (selectedDay) => {
    const safeDay = Math.max(1, Math.min(180, Math.floor(selectedDay || 1)));
    persistSelectedDay(safeDay);
    useUIStore.getState().setCurrentDay(safeDay);
    set({ selectedDay: safeDay });
  },
  saveLog: (day, log) => {
    // Bridges to persistent useCareerStore
    useCareerStore.getState().updateDailyLog(day, log);
  }
}));
