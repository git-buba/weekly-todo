import { Task, TaskStatus, WeekInfo, DailyReport, WeeklyReport } from '@/types/task';
import { WeekFilter } from '@/types/filter';
import {
  isDateInWeek,
  getCurrentWeekInfo,
  getNextWeek,
  getPreviousWeek,
  getWeekDays,
  isSameDay,
  getDayName,
  toISODate
} from './date-utils';

/**
 * Get WeekInfo based on WeekFilter type
 */
export function getWeekInfoForFilter(filter: WeekFilter): WeekInfo {
  const currentWeek = getCurrentWeekInfo();

  switch (filter) {
    case 'this-week':
      return currentWeek;
    case 'next-week':
      return getNextWeek(currentWeek);
    case 'last-week':
      return getPreviousWeek(currentWeek);
    case 'all':
      // For 'all', return a wide range (not actually used for filtering)
      return currentWeek;
    default:
      return currentWeek;
  }
}

/**
 * Core week filtering logic for tasks
 *
 * CRITICAL BUSINESS RULES:
 * 1. Incomplete tasks (upcoming, in-progress, on-hold) → ALWAYS show regardless of week
 * 2. Completed tasks → Only show if completedAt is in the selected week
 * 3. When filter is 'all' → Show all tasks
 *
 * @param tasks - Array of tasks to filter
 * @param filter - Week filter type
 * @returns Filtered array of tasks
 */
export function filterTasksByWeek(tasks: Task[], filter: WeekFilter): Task[] {
  // If 'all', return all tasks
  if (filter === 'all') {
    return tasks;
  }

  const weekInfo = getWeekInfoForFilter(filter);

  return tasks.filter(task => {
    // ALWAYS show incomplete tasks (regardless of week)
    if (task.status !== 'completed') {
      return true;
    }

    // For completed tasks, only show if completed in the selected week
    if (task.status === 'completed' && task.completedAt) {
      return isDateInWeek(task.completedAt, weekInfo);
    }

    // Edge case: completed task without completedAt date (should not happen)
    // Don't show these to avoid confusion
    return false;
  });
}

/**
 * Filter tasks by WeekInfo directly
 *
 * @param tasks - Array of tasks to filter
 * @param weekInfo - Week info to filter by
 * @param showAll - If true, return all tasks
 * @returns Filtered array of tasks
 */
export function filterTasksByWeekInfo(tasks: Task[], weekInfo: WeekInfo, showAll: boolean = false): Task[] {
  if (showAll) {
    return tasks;
  }

  return tasks.filter(task => {
    // ALWAYS show incomplete tasks (regardless of week)
    if (task.status !== 'completed') {
      return true;
    }

    // For completed tasks, only show if completed in the selected week
    if (task.status === 'completed' && task.completedAt) {
      return isDateInWeek(task.completedAt, weekInfo);
    }

    return false;
  });
}

/**
 * Group tasks by their status
 *
 * @param tasks - Array of tasks to group
 * @returns Object with tasks grouped by status
 */
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = {
    'upcoming': [],
    'in-progress': [],
    'completed': [],
    'on-hold': []
  };

  tasks.forEach(task => {
    groups[task.status].push(task);
  });

  // Sort each group
  groups.upcoming.sort(sortByOrder);
  groups['in-progress'].sort(sortByOrder);
  groups.completed.sort(sortByCompletedDate);
  groups['on-hold'].sort(sortByOrder);

  return groups;
}

/**
 * Sort tasks by order field (ascending)
 */
export function sortByOrder(a: Task, b: Task): number {
  return a.order - b.order;
}

/**
 * Sort completed tasks by completion date (most recent first)
 */
export function sortByCompletedDate(a: Task, b: Task): number {
  if (!a.completedAt) return 1;
  if (!b.completedAt) return -1;
  return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
}

/**
 * Sort tasks by creation date (most recent first)
 */
export function sortByCreatedDate(a: Task, b: Task): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

/**
 * Sort tasks by deadline (nearest first, null deadlines last)
 */
export function sortByDeadline(a: Task, b: Task): number {
  if (!a.deadline && !b.deadline) return 0;
  if (!a.deadline) return 1;
  if (!b.deadline) return -1;
  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
}

/**
 * Sort tasks by priority (urgent > high > medium > low)
 */
export function sortByPriority(a: Task, b: Task): number {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return priorityOrder[a.priority] - priorityOrder[b.priority];
}

/**
 * Filter tasks by tags (tasks must have ALL specified tags)
 */
export function filterByTags(tasks: Task[], tags: string[]): Task[] {
  if (tags.length === 0) return tasks;

  return tasks.filter(task =>
    tags.every(tag => task.tags.includes(tag))
  );
}

/**
 * Filter tasks by priority
 */
export function filterByPriority(tasks: Task[], priorities: string[]): Task[] {
  if (priorities.length === 0) return tasks;

  return tasks.filter(task => priorities.includes(task.priority));
}

/**
 * Search tasks by content (case-insensitive)
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;

  const lowerQuery = query.toLowerCase();
  return tasks.filter(task =>
    task.content.toLowerCase().includes(lowerQuery) ||
    task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Generate daily report for a specific date
 */
export function generateDailyReport(tasks: Task[], date: Date): DailyReport {
  const dateStr = toISODate(date);
  const dayOfWeek = getDayName(date);

  const createdTasks = tasks.filter(task => isSameDay(task.createdAt, date));
  const completedTasks = tasks.filter(task =>
    task.status === 'completed' &&
    task.completedAt &&
    isSameDay(task.completedAt, date)
  );

  return {
    date: dateStr,
    dayOfWeek,
    createdTasks,
    completedTasks
  };
}

/**
 * Generate weekly report with all data needed for the report page
 *
 * @param tasks - All tasks
 * @param weekInfo - Week to generate report for
 * @returns Complete weekly report structure
 */
export function generateWeeklyReport(tasks: Task[], weekInfo: WeekInfo): WeeklyReport {
  // Get all 7 days of the week (Monday to Sunday)
  const weekDays = getWeekDays(weekInfo);

  // Generate daily reports for each day
  const dailyReports: DailyReport[] = weekDays.map(date => generateDailyReport(tasks, date));

  // Get all incomplete tasks (regardless of week)
  const incompleteTasks = {
    upcoming: tasks.filter(t => t.status === 'upcoming').sort(sortByOrder),
    inProgress: tasks.filter(t => t.status === 'in-progress').sort(sortByOrder),
    onHold: tasks.filter(t => t.status === 'on-hold').sort(sortByOrder)
  };

  return {
    weekInfo,
    dailyReports,
    incompleteTasks
  };
}

/**
 * Get statistics for a set of tasks
 */
export interface TaskStatistics {
  total: number;
  completed: number;
  upcoming: number;
  inProgress: number;
  onHold: number;
  completionRate: number;
  overdue: number;
}

/**
 * Calculate statistics for tasks
 */
export function calculateTaskStatistics(tasks: Task[]): TaskStatistics {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const upcoming = tasks.filter(t => t.status === 'upcoming').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const onHold = tasks.filter(t => t.status === 'on-hold').length;

  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdue = tasks.filter(t =>
    t.status !== 'completed' &&
    t.deadline &&
    new Date(t.deadline) < now
  ).length;

  return {
    total,
    completed,
    upcoming,
    inProgress,
    onHold,
    completionRate,
    overdue
  };
}

/**
 * Get all unique tags from tasks
 */
export function getAllTags(tasks: Task[]): string[] {
  const tagSet = new Set<string>();
  tasks.forEach(task => {
    task.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Get tasks with overdue deadlines
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return tasks.filter(task =>
    task.status !== 'completed' &&
    task.deadline &&
    new Date(task.deadline) < now
  );
}

/**
 * Get tasks due today
 */
export function getTasksDueToday(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter(task =>
    task.status !== 'completed' &&
    task.deadline &&
    isSameDay(task.deadline, today)
  );
}

/**
 * Get tasks due this week
 */
export function getTasksDueThisWeek(tasks: Task[]): Task[] {
  const weekInfo = getCurrentWeekInfo();

  return tasks.filter(task =>
    task.status !== 'completed' &&
    task.deadline &&
    isDateInWeek(task.deadline, weekInfo)
  );
}
