import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runMigrationForStore } from './migrations';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  activeBadge: { id: string; name: string; emoji: string } | null;
  setActiveBadge: (badge: { id: string; name: string; emoji: string } | null) => void;
  
  // Shayla Layout Customizations
  shaylaChatHeight: number;
  shaylaRightPanelWidth: number;
  shaylaRightPanelCollapsed: boolean;
  shaylaAgentNotificationsCollapsed: boolean;
  shaylaQuickActionsCollapsed: boolean;
  
  setShaylaChatHeight: (h: number) => void;
  setShaylaRightPanelWidth: (w: number) => void;
  toggleShaylaRightPanel: () => void;
  toggleShaylaAgentNotifications: () => void;
  toggleShaylaQuickActions: () => void;
  resetShaylaLayout: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      activeSection: 'overview',
      setActiveSection: (section) => set({ activeSection: section }),
      currentDay: 1,
      setCurrentDay: (day) => set({ currentDay: day }),
      activeBadge: null,
      setActiveBadge: (badge) => set({ activeBadge: badge }),
      
      // Defaults
      shaylaChatHeight: 600,
      shaylaRightPanelWidth: 360,
      shaylaRightPanelCollapsed: false,
      shaylaAgentNotificationsCollapsed: false,
      shaylaQuickActionsCollapsed: false,
      
      setShaylaChatHeight: (h) => set({ 
        shaylaChatHeight: Math.min(Math.max(h, 380), window.innerHeight - 150) 
      }),
      setShaylaRightPanelWidth: (w) => set({ 
        shaylaRightPanelWidth: Math.min(Math.max(w, 260), 550) 
      }),
      toggleShaylaRightPanel: () => set((state) => ({ 
        shaylaRightPanelCollapsed: !state.shaylaRightPanelCollapsed 
      })),
      toggleShaylaAgentNotifications: () => set((state) => ({ 
        shaylaAgentNotificationsCollapsed: !state.shaylaAgentNotificationsCollapsed 
      })),
      toggleShaylaQuickActions: () => set((state) => ({ 
        shaylaQuickActionsCollapsed: !state.shaylaQuickActionsCollapsed 
      })),
      resetShaylaLayout: () => set({
        shaylaChatHeight: 600,
        shaylaRightPanelWidth: 360,
        shaylaRightPanelCollapsed: false,
        shaylaAgentNotificationsCollapsed: false,
        shaylaQuickActionsCollapsed: false
      })
    }),
    {
      name: 'sanju-career-os-ui-state',
      version: 141,
      migrate: (persistedState, version) => runMigrationForStore('sanju-career-os-ui-state', persistedState, version),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeSection: state.activeSection,
        currentDay: state.currentDay,
        shaylaChatHeight: state.shaylaChatHeight,
        shaylaRightPanelWidth: state.shaylaRightPanelWidth,
        shaylaRightPanelCollapsed: state.shaylaRightPanelCollapsed,
        shaylaAgentNotificationsCollapsed: state.shaylaAgentNotificationsCollapsed,
        shaylaQuickActionsCollapsed: state.shaylaQuickActionsCollapsed
      })
    }
  )
);
