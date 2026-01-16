import { WeekInfo } from '@/types/task';

/**
 * Get ISO 8601 week number (Monday as first day)
 * ISO 8601 standard:
 * - Week starts on Monday, ends on Sunday
 * - Week 1 is the week with the first Thursday of the year
 * - Weeks are numbered from 1 to 52 or 53
 *
 * Reference: https://en.wikipedia.org/wiki/ISO_8601#Week_dates
 */
export function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Set to nearest Thursday (current date + 4 - current day number)
  // Make Sunday's day number 7 instead of 0
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);

  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);

  // Calculate full weeks to nearest Thursday
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return { year: d.getFullYear(), week: weekNum };
}

/**
 * Get Monday of the ISO week
 * Monday is considered the first day of the week in ISO 8601
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // If Sunday (0), go back 6 days. Otherwise go back (day - 1) days
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get Sunday of the ISO week
 * Sunday is considered the last day of the week in ISO 8601
 */
export function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Get complete week information for the current week
 */
export function getCurrentWeekInfo(): WeekInfo {
  const now = new Date();
  return getWeekInfo(now);
}

/**
 * Get week information for a specific date
 */
export function getWeekInfo(date: Date): WeekInfo {
  const { year, week } = getISOWeek(date);
  const startDate = getMonday(date);
  const endDate = getSunday(date);

  return { year, week, startDate, endDate };
}

/**
 * Get next week information
 */
export function getNextWeek(current: WeekInfo): WeekInfo {
  const nextMonday = new Date(current.startDate);
  nextMonday.setDate(nextMonday.getDate() + 7);
  return getWeekInfo(nextMonday);
}

/**
 * Get previous week information
 */
export function getPreviousWeek(current: WeekInfo): WeekInfo {
  const prevMonday = new Date(current.startDate);
  prevMonday.setDate(prevMonday.getDate() - 7);
  return getWeekInfo(prevMonday);
}

/**
 * Check if a date is within a week range (inclusive)
 */
export function isDateInWeek(date: string | Date, weekInfo: WeekInfo): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const start = new Date(weekInfo.startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(weekInfo.endDate);
  end.setHours(23, 59, 59, 999);

  return d >= start && d <= end;
}

/**
 * Format week range for display
 * Example: "Jan 6 - Jan 12, 2026"
 */
export function formatWeekRange(weekInfo: WeekInfo, locale: string = 'en-US'): string {
  const start = weekInfo.startDate.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric'
  });
  const end = weekInfo.endDate.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `${start} - ${end}`;
}

/**
 * Format week in ISO format (YYYY-WW)
 * Example: "2026-W03"
 */
export function formatISOWeek(weekInfo: WeekInfo): string {
  const weekNum = weekInfo.week.toString().padStart(2, '0');
  return `${weekInfo.year}-W${weekNum}`;
}

/**
 * Parse ISO week string to WeekInfo
 * Example: "2026-W03" -> WeekInfo
 */
export function parseISOWeek(isoWeek: string): WeekInfo {
  const match = isoWeek.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid ISO week format: ${isoWeek}`);
  }

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // Calculate the date of the Monday of this week
  // Find Jan 4th (always in week 1)
  const jan4 = new Date(year, 0, 4);
  const jan4WeekInfo = getWeekInfo(jan4);

  // Calculate offset in weeks
  const weekOffset = week - jan4WeekInfo.week;
  const targetMonday = new Date(jan4WeekInfo.startDate);
  targetMonday.setDate(targetMonday.getDate() + (weekOffset * 7));

  return getWeekInfo(targetMonday);
}

/**
 * Get all days in a week (for report generation)
 * Returns array of 7 dates from Monday to Sunday
 */
export function getWeekDays(weekInfo: WeekInfo): Date[] {
  const days: Date[] = [];
  const current = new Date(weekInfo.startDate);
  current.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Check if two dates are the same day (ignoring time)
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Get day name from date
 * Example: "Monday", "Tuesday", etc.
 */
export function getDayName(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Format date for display
 * Example: "Jan 13, 2026"
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date to ISO date string (YYYY-MM-DD)
 * Uses local timezone instead of UTC
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return d < now;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

/**
 * Get relative date description
 * Example: "Today", "Tomorrow", "Yesterday", or formatted date
 */
export function getRelativeDateDescription(date: Date | string, locale: string = 'en-US'): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return formatDate(date, locale);
}
