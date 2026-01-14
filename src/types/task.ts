// Task status types
export type TaskStatus = 'upcoming' | 'in-progress' | 'completed' | 'on-hold';

// Task priority types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Main Task interface
export interface Task {
  id: string;                    // UUID
  content: string;               // Task description
  status: TaskStatus;            // Current status
  priority: TaskPriority;        // Priority level
  deadline: string | null;       // ISO 8601 date string (YYYY-MM-DD)
  tags: string[];                // Array of tag strings
  createdAt: string;             // ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
  completedAt: string | null;    // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
  userId: string | null;         // For future auth (null for localStorage)
  order: number;                 // For ordering within status
}

// Week information for ISO 8601 weeks
export interface WeekInfo {
  year: number;                  // ISO week-numbering year
  week: number;                  // ISO week number (1-53)
  startDate: Date;               // Monday (start of week)
  endDate: Date;                 // Sunday (end of week)
}

// Daily report for weekly report page
export interface DailyReport {
  date: string;                  // ISO 8601 date (YYYY-MM-DD)
  dayOfWeek: string;             // 'Monday', 'Tuesday', etc.
  createdTasks: Task[];          // Tasks created on this day
  completedTasks: Task[];        // Tasks completed on this day
}

// Weekly report structure
export interface WeeklyReport {
  weekInfo: WeekInfo;
  dailyReports: DailyReport[];   // 7 days (Mon-Sun)
  incompleteTasks: {
    upcoming: Task[];
    inProgress: Task[];
    onHold: Task[];
  };
}

// Type guards
export function isValidTaskStatus(status: string): status is TaskStatus {
  return ['upcoming', 'in-progress', 'completed', 'on-hold'].includes(status);
}

export function isValidTaskPriority(priority: string): priority is TaskPriority {
  return ['low', 'medium', 'high', 'urgent'].includes(priority);
}

// Helper type for creating a new task (without generated fields)
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'order'> & {
  order?: number;
};

// Helper type for updating a task
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>;
