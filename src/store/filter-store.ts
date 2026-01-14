import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeekFilter, ViewMode } from '@/types/filter';
import { WeekInfo } from '@/types/task';
import {
  getCurrentWeekInfo,
  getNextWeek,
  getPreviousWeek,
  formatISOWeek
} from '@/lib/date-utils';
import { getWeekInfoForFilter } from '@/lib/filter-utils';

interface FilterStore {
  // State
  weekFilter: WeekFilter;
  selectedWeek: WeekInfo;
  viewMode: ViewMode;

  // Actions
  setWeekFilter: (filter: WeekFilter) => void;
  setSelectedWeek: (week: WeekInfo) => void;
  setViewMode: (mode: ViewMode) => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  goToCurrentWeek: () => void;
  toggleViewMode: () => void;
  reset: () => void;
}

const initialWeek = getCurrentWeekInfo();

/**
 * Filter Store using Zustand with localStorage persistence
 *
 * Manages UI state for:
 * - Week filtering (this week, last week, next week, all)
 * - Selected week for reports
 * - View mode (kanban vs list)
 */
export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      // Initial state
      weekFilter: 'this-week',
      selectedWeek: initialWeek,
      viewMode: 'kanban',

      /**
       * Set the week filter
       * Also updates selectedWeek to match the filter
       */
      setWeekFilter: (filter: WeekFilter) => {
        const weekInfo = getWeekInfoForFilter(filter);
        set({ weekFilter: filter, selectedWeek: weekInfo });
      },

      /**
       * Set a specific week (for report navigation)
       */
      setSelectedWeek: (week: WeekInfo) => {
        set({ selectedWeek: week });
      },

      /**
       * Set view mode (kanban or list)
       */
      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
      },

      /**
       * Navigate to previous or next week
       * Used in the report page
       */
      navigateWeek: (direction: 'prev' | 'next') => {
        const { selectedWeek } = get();
        const newWeek = direction === 'next'
          ? getNextWeek(selectedWeek)
          : getPreviousWeek(selectedWeek);

        set({ selectedWeek: newWeek });
      },

      /**
       * Go back to current week
       */
      goToCurrentWeek: () => {
        const currentWeek = getCurrentWeekInfo();
        set({ selectedWeek: currentWeek, weekFilter: 'this-week' });
      },

      /**
       * Toggle between kanban and list view
       */
      toggleViewMode: () => {
        const { viewMode } = get();
        const newMode: ViewMode = viewMode === 'kanban' ? 'list' : 'kanban';
        set({ viewMode: newMode });
      },

      /**
       * Reset to default state
       */
      reset: () => {
        set({
          weekFilter: 'this-week',
          selectedWeek: getCurrentWeekInfo(),
          viewMode: 'kanban'
        });
      }
    }),
    {
      name: 'weekly-todo-filters', // localStorage key
      version: 1,
      // Only persist weekFilter and viewMode, not selectedWeek (always start with current week)
      partialize: (state) => ({
        weekFilter: state.weekFilter,
        viewMode: state.viewMode
      }),
      // On rehydration, set selectedWeek based on weekFilter
      onRehydrateStorage: () => (state) => {
        if (state) {
          const weekInfo = getWeekInfoForFilter(state.weekFilter);
          state.selectedWeek = weekInfo;
        }
      }
    }
  )
);

// Convenience selectors
export const useCurrentWeekFilter = () => useFilterStore(state => state.weekFilter);

export const useCurrentViewMode = () => useFilterStore(state => state.viewMode);

export const useSelectedWeek = () => useFilterStore(state => state.selectedWeek);

export const useIsThisWeek = () => {
  const weekFilter = useFilterStore(state => state.weekFilter);
  return weekFilter === 'this-week';
};

export const useWeekDisplay = () => {
  const selectedWeek = useFilterStore(state => state.selectedWeek);
  return formatISOWeek(selectedWeek);
};
