import { WeekInfo } from './task';

// Week filter options
export type WeekFilter = 'this-week' | 'last-week' | 'next-week' | 'all';

// View mode for TODO page
export type ViewMode = 'kanban' | 'list';

// Filter state interface
export interface FilterState {
  weekFilter: WeekFilter;
  selectedWeek: WeekInfo;
  viewMode: ViewMode;
}

// Settings stored in localStorage
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  viewMode: ViewMode;
  lastViewedWeek: string;        // ISO week string 'YYYY-WW'
}

// Type guard for week filter
export function isValidWeekFilter(filter: string): filter is WeekFilter {
  return ['this-week', 'last-week', 'next-week', 'all'].includes(filter);
}

// Type guard for view mode
export function isValidViewMode(mode: string): mode is ViewMode {
  return ['kanban', 'list'].includes(mode);
}
