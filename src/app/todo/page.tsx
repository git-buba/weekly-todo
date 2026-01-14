"use client";

import { useEffect, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { WeekNavigation } from "@/components/report/week-navigation";
import { ViewToggle } from "@/components/todo/view-toggle";
import { KanbanBoard } from "@/components/todo/kanban-board";
import { TaskListView } from "@/components/todo/task-list-view";
import { EmptyState } from "@/components/todo/empty-state";
import { TaskDialog } from "@/components/todo/task-dialog";
import { DeleteConfirmationDialog } from "@/components/todo/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTaskStore } from "@/store/task-store";
import { useFilterStore } from "@/store/filter-store";
import { filterTasksByWeekInfo } from "@/lib/filter-utils";
import { getCurrentWeekInfo } from "@/lib/date-utils";
import { Task, CreateTaskInput, TaskStatus } from "@/types/task";

export default function TodoPage() {
  const [isClient, setIsClient] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; content: string } | null>(null);

  const { tasks, isLoading, initialize, createTask, updateTask, deleteTask, reorderTasks } = useTaskStore();
  const { weekFilter, selectedWeek, viewMode, navigateWeek, setSelectedWeek } = useFilterStore();
  const { toast } = useToast();
  const showAllWeeks = weekFilter === 'all';

  // Initialize store on mount
  useEffect(() => {
    setIsClient(true);
    initialize();
  }, [initialize]);

  // Filter tasks based on selected week
  const filteredTasks = isClient ? filterTasksByWeekInfo(tasks, selectedWeek, showAllWeeks) : [];

  // Week navigation handlers
  const handlePrevious = () => navigateWeek("prev");
  const handleNext = () => navigateWeek("next");
  const handleToday = () => {
    const currentWeek = getCurrentWeekInfo();
    setSelectedWeek(currentWeek);
  };

  // Handler for creating a new task
  const handleCreateTask = () => {
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  // Handler for editing an existing task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  // Handler for submitting task (create or update)
  const handleSubmitTask = async (taskData: CreateTaskInput) => {
    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, taskData);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        // Create new task
        await createTask(taskData);
        toast({
          title: "Task created",
          description: "Your task has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: editingTask
          ? "Failed to update task. Please try again."
          : "Failed to create task. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  // Handler for initiating task deletion
  const handleDeleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTaskToDelete({ id: task.id, content: task.content });
      setDeleteDialogOpen(true);
    }
  };

  // Handler for confirming task deletion
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTaskToDelete(null);
    }
  };

  // Handler for moving a task to a different status (drag and drop)
  const handleMoveTask = async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    try {
      await updateTask(taskId, { status: newStatus, order: newOrder });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler for reordering tasks within the same column
  const handleReorderTasks = async (updatedTasks: Task[]) => {
    try {
      await reorderTasks(updatedTasks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 m-auto" id="main-content">
          <div className="flex items-center justify-center h-64" role="status" aria-live="polite" aria-label="Loading tasks">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8 space-y-8 m-auto" id="main-content">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TODO</h1>
            <p className="text-muted-foreground">
              Manage your tasks and stay organized
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="lg">
              <Link href="/todo/report">
                <TrendingUp className="mr-2 h-5 w-5" />
                Report
              </Link>
            </Button>
            <Button onClick={handleCreateTask} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Task
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <WeekNavigation
          weekInfo={selectedWeek}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
        />

        {/* View Controls */}
        <div className="flex items-center justify-end">
          <ViewToggle />
        </div>

        {/* Task Count */}
        {filteredTasks.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64" role="status" aria-live="polite" aria-label="Loading tasks">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState onCreateTask={handleCreateTask} />
        ) : (
          <div className="pb-8">
            {viewMode === "kanban" ? (
              <KanbanBoard
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onReorderTasks={handleReorderTasks}
              />
            ) : (
              <TaskListView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onReorderTasks={handleReorderTasks}
              />
            )}
          </div>
        )}
      </main>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSubmit={handleSubmitTask}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        taskContent={taskToDelete?.content}
      />
    </div>
  );
}
