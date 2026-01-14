"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./task-card";
import { DroppableColumn } from "./droppable-column";
import { DraggableTaskCard } from "./draggable-task-card";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onMoveTask?: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  onReorderTasks?: (tasks: Task[]) => void;
}

const columns: { id: TaskStatus; title: string; description: string }[] = [
  { id: "upcoming", title: "Upcoming", description: "Tasks to start" },
  { id: "in-progress", title: "In Progress", description: "Currently working on" },
  { id: "completed", title: "Completed", description: "Finished tasks" },
  { id: "on-hold", title: "On Hold", description: "Paused tasks" },
];

export function KanbanBoard({
  tasks,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onReorderTasks,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor)
  );

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      const column = columns.find((col) => col.id === task.status);
      setAnnouncement(`Picked up task from ${column?.title || "column"}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      setAnnouncement("Task dropped. No changes made.");
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column (overId is a status)
    const targetColumn = columns.find((col) => col.id === overId);

    if (targetColumn) {
      // Dropped on a column - move to that status
      const targetTasks = getTasksByStatus(targetColumn.id);
      const newOrder = targetTasks.length; // Add to end

      if (activeTask.status !== targetColumn.id) {
        onMoveTask?.(activeId, targetColumn.id, newOrder);
        const fromColumn = columns.find((col) => col.id === activeTask.status);
        setAnnouncement(`Task moved from ${fromColumn?.title} to ${targetColumn.title}`);
      } else {
        setAnnouncement(`Task dropped in ${targetColumn.title}. No changes made.`);
      }
    } else {
      // Dropped on another task - handle reordering
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      if (activeTask.status === overTask.status) {
        // Reordering within the same column
        const columnTasks = getTasksByStatus(activeTask.status);
        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        if (oldIndex !== newIndex) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex);

          // Update order values
          const updatedTasks = tasks.map((task) => {
            if (task.status === activeTask.status) {
              const newOrderIndex = reordered.findIndex((t) => t.id === task.id);
              if (newOrderIndex !== -1) {
                return { ...task, order: newOrderIndex };
              }
            }
            return task;
          });

          onReorderTasks?.(updatedTasks);
          const column = columns.find((col) => col.id === activeTask.status);
          setAnnouncement(`Task reordered within ${column?.title}`);
        } else {
          setAnnouncement("Task position unchanged");
        }
      } else {
        // Moving to a different column
        const targetTasks = getTasksByStatus(overTask.status);
        const newIndex = targetTasks.findIndex((t) => t.id === overId);

        onMoveTask?.(activeId, overTask.status, newIndex);
        const fromColumn = columns.find((col) => col.id === activeTask.status);
        const toColumn = columns.find((col) => col.id === overTask.status);
        setAnnouncement(`Task moved from ${fromColumn?.title} to ${toColumn?.title}`);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Screen reader announcements for drag and drop */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const taskIds = columnTasks.map((task) => task.id);

          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              description={column.description}
              count={columnTasks.length}
            >
              <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-muted-foreground" role="status">
                      Drop tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>

      {/* Drag Overlay - shows the dragging task */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? (
          <div className="scale-105 cursor-grabbing shadow-xl">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
