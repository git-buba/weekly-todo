import { create } from 'zustand';
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { createStorageAdapter } from '@/services/storage/storage-adapter';
import { migrateFromLocalStorage, isMigrationNeeded } from '@/services/storage/migration';
import { IndexedDBStorageAdapter } from '@/services/storage/indexeddb-storage';

// Initialize storage adapter
const storage = createStorageAdapter();

interface TaskStore {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus, newOrder?: number) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  clearError: () => void;
  reset: () => Promise<void>;
}

/**
 * Task Store using Zustand
 *
 * Manages all task-related state and operations.
 * Uses the storage adapter for persistence (localStorage or Supabase).
 */
export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  /**
   * Initialize the store (fetch tasks on first load)
   * Runs migration from localStorage to IndexedDB if needed
   */
  initialize: async () => {
    const { isInitialized, fetchTasks } = get();

    if (!isInitialized) {
      // Run migration from localStorage to IndexedDB if needed
      if (typeof window !== 'undefined' && IndexedDBStorageAdapter.isSupported() && isMigrationNeeded()) {
        try {
          const result = await migrateFromLocalStorage();
          if (result.success && result.tasksCount > 0) {
            console.log(`Migrated ${result.tasksCount} tasks from localStorage to IndexedDB`);
          }
        } catch (error) {
          console.error('Migration error:', error);
          // Continue with fetching - localStorage fallback will work
        }
      }

      await fetchTasks();
      set({ isInitialized: true });
    }
  },

  /**
   * Fetch all tasks from storage
   */
  fetchTasks: async () => {
    set({ isLoading: true, error: null });

    try {
      const tasks = await storage.getAll();
      set({ tasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      console.error('Error fetching tasks:', error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Create a new task
   */
  createTask: async (taskData: CreateTaskInput) => {
    set({ error: null });

    try {
      const newTask = await storage.create(taskData);

      // Optimistic update
      set(state => ({
        tasks: [...state.tasks, newTask]
      }));

      return newTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      console.error('Error creating task:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: string, updates: UpdateTaskInput) => {
    set({ error: null });

    try {
      const updatedTask = await storage.update(id, updates);

      // Optimistic update
      set(state => ({
        tasks: state.tasks.map(t => (t.id === id ? updatedTask : t))
      }));

      return updatedTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      console.error('Error updating task:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: string) => {
    set({ error: null });

    try {
      await storage.delete(id);

      // Optimistic update
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      console.error('Error deleting task:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Move a task to a different status (used in drag & drop)
   */
  moveTask: async (id: string, newStatus: TaskStatus, newOrder?: number) => {
    const { updateTask } = get();

    const updates: UpdateTaskInput = {
      status: newStatus
    };

    if (newOrder !== undefined) {
      updates.order = newOrder;
    }

    await updateTask(id, updates);
  },

  /**
   * Reorder tasks (batch update for drag & drop reordering)
   */
  reorderTasks: async (updatedTasks: Task[]) => {
    set({ error: null });

    try {
      const savedTasks = await storage.bulkUpdate(updatedTasks);

      // Update state with reordered tasks
      set({ tasks: savedTasks });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder tasks';
      console.error('Error reordering tasks:', error);
      set({ error: errorMessage });

      // Refresh tasks from storage to recover from error
      get().fetchTasks();

      throw error;
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store (clear all tasks - mainly for testing)
   */
  reset: async () => {
    try {
      await storage.clear();
      set({ tasks: [], isLoading: false, error: null, isInitialized: false });
    } catch (error) {
      console.error('Error resetting store:', error);
    }
  }
}));

// Convenience selectors
export const useTask = (id: string) => useTaskStore(state => state.tasks.find(t => t.id === id));

export const useTasksByStatus = (status: TaskStatus) =>
  useTaskStore(state => state.tasks.filter(t => t.status === status));

export const useTaskCount = () => useTaskStore(state => state.tasks.length);

export const useCompletedTaskCount = () =>
  useTaskStore(state => state.tasks.filter(t => t.status === 'completed').length);
