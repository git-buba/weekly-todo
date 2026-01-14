import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { StorageAdapter } from './storage-adapter';
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '@/types/task';

const DB_NAME = 'weekly-todo-db';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';

/**
 * IndexedDB Storage Adapter
 *
 * Implements the StorageAdapter interface using browser IndexedDB.
 * Provides larger storage capacity (~50MB+) compared to localStorage (~5-10MB).
 *
 * Benefits:
 * - Larger storage capacity
 * - Better performance with large datasets
 * - Support for indexes for efficient querying
 * - Transactional operations
 */
export class IndexedDBStorageAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  /**
   * Initialize or get the database connection (lazy initialization)
   */
  private async getDB(): Promise<IDBPDatabase> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB is not available during SSR');
    }

    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create tasks object store if it doesn't exist
          if (!db.objectStoreNames.contains(TASKS_STORE)) {
            const taskStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
            taskStore.createIndex('by-status', 'status');
            taskStore.createIndex('by-createdAt', 'createdAt');
            taskStore.createIndex('by-userId', 'userId');
            taskStore.createIndex('by-status-order', ['status', 'order']);
          }
        },
        blocked() {
          console.warn('IndexedDB upgrade blocked. Close other tabs using the app.');
        },
        blocking() {
          console.warn('IndexedDB blocking another connection.');
        },
        terminated() {
          console.error('IndexedDB connection terminated unexpectedly.');
        }
      });
    }

    return this.dbPromise;
  }

  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    const db = await this.getDB();
    return db.getAll(TASKS_STORE);
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task | null> {
    const db = await this.getDB();
    const task = await db.get(TASKS_STORE, id);
    return task || null;
  }

  /**
   * Create a new task
   */
  async create(taskData: CreateTaskInput): Promise<Task> {
    const db = await this.getDB();
    const now = new Date().toISOString();

    // Calculate order: max order in status + 1
    const tasksInStatus = await this.getByStatus(taskData.status);
    const maxOrder = tasksInStatus.length > 0
      ? Math.max(...tasksInStatus.map(t => t.order))
      : -1;

    const newTask: Task = {
      id: uuidv4(),
      content: taskData.content,
      status: taskData.status,
      priority: taskData.priority,
      deadline: taskData.deadline,
      tags: taskData.tags,
      createdAt: now,
      updatedAt: now,
      completedAt: taskData.status === 'completed' ? now : null,
      userId: taskData.userId,
      order: taskData.order !== undefined ? taskData.order : maxOrder + 1
    };

    await db.add(TASKS_STORE, newTask);
    return newTask;
  }

  /**
   * Update an existing task
   */
  async update(id: string, updates: UpdateTaskInput): Promise<Task> {
    const db = await this.getDB();
    const existingTask = await db.get(TASKS_STORE, id);

    if (!existingTask) {
      throw new Error(`Task with id ${id} not found`);
    }

    const now = new Date().toISOString();

    // Handle completedAt logic
    let completedAt = existingTask.completedAt;

    // If status is changing to completed, set completedAt
    if (updates.status === 'completed' && existingTask.status !== 'completed') {
      completedAt = now;
    }

    // If status is changing from completed to something else, clear completedAt
    if (updates.status && updates.status !== 'completed' && existingTask.status === 'completed') {
      completedAt = null;
    }

    // If completedAt is explicitly provided in updates, use that
    if (updates.completedAt !== undefined) {
      completedAt = updates.completedAt;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      id: existingTask.id, // Prevent ID from being changed
      createdAt: existingTask.createdAt, // Prevent createdAt from being changed
      updatedAt: now,
      completedAt
    };

    await db.put(TASKS_STORE, updatedTask);
    return updatedTask;
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    const db = await this.getDB();
    const existingTask = await db.get(TASKS_STORE, id);

    if (!existingTask) {
      throw new Error(`Task with id ${id} not found`);
    }

    await db.delete(TASKS_STORE, id);
  }

  /**
   * Bulk update tasks (for reordering, migration)
   */
  async bulkUpdate(updatedTasks: Task[]): Promise<Task[]> {
    const db = await this.getDB();
    const now = new Date().toISOString();
    const tx = db.transaction(TASKS_STORE, 'readwrite');

    const tasksWithTimestamp = updatedTasks.map(task => ({
      ...task,
      updatedAt: now
    }));

    await Promise.all([
      ...tasksWithTimestamp.map(task => tx.store.put(task)),
      tx.done
    ]);

    return tasksWithTimestamp;
  }

  /**
   * Get tasks by status
   */
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const db = await this.getDB();
    return db.getAllFromIndex(TASKS_STORE, 'by-status', status);
  }

  /**
   * Get tasks by date range (based on createdAt)
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const db = await this.getDB();
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Use index with IDBKeyRange for efficient querying
    const range = IDBKeyRange.bound(startISO, endISO);
    return db.getAllFromIndex(TASKS_STORE, 'by-createdAt', range);
  }

  /**
   * Clear all tasks
   */
  async clear(): Promise<void> {
    const db = await this.getDB();
    await db.clear(TASKS_STORE);
  }

  /**
   * Check if IndexedDB is available and supported
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'indexedDB' in window;
  }

  /**
   * Get storage statistics (for debugging/monitoring)
   */
  async getStorageStats(): Promise<{ taskCount: number }> {
    const db = await this.getDB();
    const count = await db.count(TASKS_STORE);
    return { taskCount: count };
  }
}
