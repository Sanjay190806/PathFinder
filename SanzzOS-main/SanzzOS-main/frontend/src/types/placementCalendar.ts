
export interface CalendarFilters {
  phase: string;
  keyword: string;
  status: string;
}

export type DayCompletionType = 'missed' | 'partial' | 'minimum' | 'perfect' | 'freeze' | 'future';
