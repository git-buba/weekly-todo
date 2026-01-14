import { Task } from '@/types/task';
import { IndexedDBStorageAdapter } from './indexeddb-storage';

const LOCALSTORAGE_KEY = 'weekly-todo-tasks';
const MIGRATION_FLAG_KEY = 'weekly-todo-migration-completed';

export interface MigrationResult {
  success: boolean;
  tasksCount: number;
  error?: string;
}

/**
 * Migrate tasks from localStorage to IndexedDB
 *
 * This is a one-time operation that runs on first load after IndexedDB is enabled.
 * After successful migration, localStorage data is deleted to free up space.
 */
export async function migrateFromLocalStorage(): Promise<MigrationResult> {
  // Check if migration already completed
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === 'true') {
    return { success: true, tasksCount: 0 };
  }

  try {
    // Read existing data from localStorage
    const localStorageData = localStorage.getItem(LOCALSTORAGE_KEY);

    if (!localStorageData) {
      // No data to migrate
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return { success: true, tasksCount: 0 };
    }

    const tasks: Task[] = JSON.parse(localStorageData);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return { success: true, tasksCount: 0 };
    }

    // Validate tasks before migration
    const validTasks = tasks.filter(task =>
      task.id && task.content && task.status
    );

    if (validTasks.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return { success: true, tasksCount: 0 };
    }

    // Initialize IndexedDB and bulk insert tasks
    const indexedDBAdapter = new IndexedDBStorageAdapter();
    await indexedDBAdapter.bulkUpdate(validTasks);

    // Mark migration as complete
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

    // Delete localStorage data after successful migration
    localStorage.removeItem(LOCALSTORAGE_KEY);

    console.log(`Migration complete: ${validTasks.length} tasks migrated to IndexedDB`);

    return {
      success: true,
      tasksCount: validTasks.length
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      tasksCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if migration is needed
 */
export function isMigrationNeeded(): boolean {
  if (typeof window === 'undefined') return false;

  const migrationCompleted = localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
  const hasLocalStorageData = localStorage.getItem(LOCALSTORAGE_KEY) !== null;

  return !migrationCompleted && hasLocalStorageData;
}

/**
 * Reset migration flag (for testing purposes)
 */
export function resetMigrationFlag(): void {
  localStorage.removeItem(MIGRATION_FLAG_KEY);
}
