export interface UserProfile {
  name: string;
  startDate: string;
  totalDays: number;
}

export interface AppSettings {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
}
