import { v4 as uuidv4 } from 'uuid';
import { StorageAdapter } from './storage-adapter';
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '@/types/task';

const STORAGE_KEY = 'weekly-todo-tasks';

/**
 * localStorage Storage Adapter
 *
 * Implements the StorageAdapter interface using browser localStorage.
 * Data is persisted locally and survives page refreshes.
 *
 * Limitations:
 * - ~5-10MB storage limit (varies by browser)
 * - Data not synced across devices
 * - Data cleared if user clears browser data
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Get all tasks from localStorage
   */
  private getTasks(): Task[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  /**
   * Save tasks to localStorage
   */
  private saveTasks(tasks: Task[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      // Could show user notification about storage quota
    }
  }

  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    return this.getTasks();
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task | null> {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    return task || null;
  }

  /**
   * Create a new task
   */
  async create(taskData: CreateTaskInput): Promise<Task> {
    const tasks = this.getTasks();
    const now = new Date().toISOString();

    // Calculate order: max order in status + 1
    const tasksInStatus = tasks.filter(t => t.status === taskData.status);
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

    tasks.push(newTask);
    this.saveTasks(tasks);

    return newTask;
  }

  /**
   * Update an existing task
   */
  async update(id: string, updates: UpdateTaskInput): Promise<Task> {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const existingTask = tasks[index];
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

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    return updatedTask;
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== id);

    if (filtered.length === tasks.length) {
      throw new Error(`Task with id ${id} not found`);
    }

    this.saveTasks(filtered);
  }

  /**
   * Bulk update tasks (for reordering)
   */
  async bulkUpdate(updatedTasks: Task[]): Promise<Task[]> {
    const now = new Date().toISOString();

    // Update timestamps
    const tasksWithTimestamp = updatedTasks.map(task => ({
      ...task,
      updatedAt: now
    }));

    this.saveTasks(tasksWithTimestamp);
    return tasksWithTimestamp;
  }

  /**
   * Get tasks by status
   */
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const tasks = this.getTasks();
    return tasks.filter(t => t.status === status);
  }

  /**
   * Get tasks by date range (based on createdAt)
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const tasks = this.getTasks();
    return tasks.filter(t => {
      const createdAt = new Date(t.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });
  }

  /**
   * Clear all tasks (mainly for testing)
   */
  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Get storage statistics (for debugging/monitoring)
   */
  getStorageStats(): { taskCount: number; storageSize: number } {
    const tasks = this.getTasks();
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const storageSize = new Blob([data]).size; // Size in bytes

    return {
      taskCount: tasks.length,
      storageSize
    };
  }

  /**
   * Export tasks as JSON string (for backup)
   */
  exportTasks(): string {
    const tasks = this.getTasks();
    return JSON.stringify(tasks, null, 2);
  }

  /**
   * Import tasks from JSON string (for restore)
   */
  importTasks(jsonData: string): void {
    try {
      const tasks = JSON.parse(jsonData) as Task[];

      // Validate that it's an array
      if (!Array.isArray(tasks)) {
        throw new Error('Invalid data format: expected array');
      }

      // Basic validation of task structure
      tasks.forEach((task, index) => {
        if (!task.id || !task.content || !task.status) {
          throw new Error(`Invalid task at index ${index}: missing required fields`);
        }
      });

      this.saveTasks(tasks);
    } catch (error) {
      console.error('Error importing tasks:', error);
      throw new Error('Failed to import tasks: invalid data format');
    }
  }
}
