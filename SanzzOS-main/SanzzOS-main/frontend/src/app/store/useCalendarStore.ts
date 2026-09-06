import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runMigrationForStore } from './migrations';

export type CalendarEventType =
  | 'study'
  | 'interview'
  | 'oa'
  | 'assignment'
  | 'milestone'
  | 'resume'
  | 'german'
  | 'revision'
  | 'mock'
  | 'career'
  | 'reminder';

export interface RecurrenceRule {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly';
  interval?: number; // e.g. every 2 weeks
  endDate?: string;  // ISO string
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  start: string; // ISO String
  end: string;   // ISO String
  description?: string;
  color?: string;
  isRecurring?: boolean;
  recurrence?: RecurrenceRule;
  status?: 'scheduled' | 'completed' | 'cancelled';
  relatedId?: string; // links to project ID, application ID, or revision ID
  createdFromRecurrence?: boolean; // if generated on-the-fly
}

interface CalendarStoreState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  setEvents: (events: CalendarEvent[]) => void;
}

export const useCalendarStore = create<CalendarStoreState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (eventInput) =>
        set((state) => ({
          events: [...state.events, { ...eventInput, id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }],
        })),
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      duplicateEvent: (id) =>
        set((state) => {
          const target = state.events.find((e) => e.id === id);
          if (!target) return state;
          return {
            events: [
              ...state.events,
              {
                ...target,
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: `${target.title} (Copy)`,
              },
            ],
          };
        }),
      setEvents: (events) => set({ events }),
    }),
    {
      name: 'sanzz_os_calendar_events_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_calendar_events_v1', persistedState, version),
    }
  )
);
