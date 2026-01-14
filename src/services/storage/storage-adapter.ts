import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '@/types/task';

/**
 * Storage Adapter Interface
 *
 * This interface provides an abstraction layer for task storage,
 * allowing the application to switch between different storage backends
 * (localStorage, Supabase, etc.) without changing application code.
 *
 * All methods return Promises to support both sync (localStorage) and
 * async (API/database) implementations.
 */
export interface StorageAdapter {
  /**
   * Get all tasks for the current user
   */
  getAll(): Promise<Task[]>;

  /**
   * Get a single task by ID
   */
  getById(id: string): Promise<Task | null>;

  /**
   * Create a new task
   */
  create(task: CreateTaskInput): Promise<Task>;

  /**
   * Update an existing task
   */
  update(id: string, updates: UpdateTaskInput): Promise<Task>;

  /**
   * Delete a task
   */
  delete(id: string): Promise<void>;

  /**
   * Bulk update tasks (for reordering, batch operations)
   */
  bulkUpdate(tasks: Task[]): Promise<Task[]>;

  /**
   * Get tasks by status
   */
  getByStatus(status: TaskStatus): Promise<Task[]>;

  /**
   * Get tasks in a date range (based on createdAt)
   */
  getByDateRange(startDate: Date, endDate: Date): Promise<Task[]>;

  /**
   * Clear all tasks (mainly for testing)
   */
  clear(): Promise<void>;
}

/**
 * Storage Adapter Factory
 *
 * Creates and returns the appropriate storage adapter based on
 * environment configuration.
 *
 * Priority:
 * 1. Supabase (if configured)
 * 2. IndexedDB (default, larger storage capacity)
 * 3. localStorage (fallback if IndexedDB not supported)
 * 4. NoOpStorageAdapter (SSR)
 */
export function createStorageAdapter(): StorageAdapter {
  // Check environment variable to determine which adapter to use
  const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

  if (useSupabase) {
    // Future: return new SupabaseStorageAdapter();
    throw new Error('Supabase adapter not yet implemented');
  }

  // Server-side: return a no-op adapter
  if (typeof window === 'undefined') {
    return new NoOpStorageAdapter();
  }

  // Client-side: use IndexedDB with localStorage fallback
  const { IndexedDBStorageAdapter } = require('./indexeddb-storage');

  if (IndexedDBStorageAdapter.isSupported()) {
    return new IndexedDBStorageAdapter();
  }

  // Fallback to localStorage if IndexedDB not supported
  console.warn('IndexedDB not supported, falling back to localStorage');
  const { LocalStorageAdapter } = require('./local-storage');
  return new LocalStorageAdapter();
}

/**
 * No-Op Storage Adapter for SSR
 *
 * Returns empty data during server-side rendering.
 * Actual data loading happens client-side.
 */
class NoOpStorageAdapter implements StorageAdapter {
  async getAll(): Promise<Task[]> {
    return [];
  }

  async getById(id: string): Promise<Task | null> {
    return null;
  }

  async create(task: CreateTaskInput): Promise<Task> {
    throw new Error('Cannot create task during SSR');
  }

  async update(id: string, updates: UpdateTaskInput): Promise<Task> {
    throw new Error('Cannot update task during SSR');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Cannot delete task during SSR');
  }

  async bulkUpdate(tasks: Task[]): Promise<Task[]> {
    throw new Error('Cannot bulk update during SSR');
  }

  async getByStatus(status: TaskStatus): Promise<Task[]> {
    return [];
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return [];
  }

  async clear(): Promise<void> {
    // No-op
  }
}
