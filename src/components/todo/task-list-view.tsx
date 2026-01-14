"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
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
import { TaskListItem } from "./task-list-item";
import { DraggableTaskListItem } from "./draggable-task-list-item";
import { DroppableListSection } from "./droppable-list-section";
import { Separator } from "@/components/ui/separator";

interface TaskListViewProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onMoveTask?: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  onReorderTasks?: (tasks: Task[]) => void;
}

const sections: { id: TaskStatus; title: string; description: string }[] = [
  { id: "upcoming", title: "Upcoming", description: "Tasks to start" },
  { id: "in-progress", title: "In Progress", description: "Currently working on" },
  { id: "completed", title: "Completed", description: "Finished tasks" },
  { id: "on-hold", title: "On Hold", description: "Paused tasks" },
];

export function TaskListView({
  tasks,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onReorderTasks,
}: TaskListViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
      const section = sections.find((s) => s.id === task.status);
      setAnnouncement(`Picked up task from ${section?.title || "section"}`);
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

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a section
    const targetSection = sections.find((s) => s.id === overId);

    if (targetSection) {
      // Dropped on a section - move to that status
      const targetTasks = getTasksByStatus(targetSection.id);
      const newOrder = targetTasks.length;

      if (activeTask.status !== targetSection.id) {
        onMoveTask?.(activeId, targetSection.id, newOrder);
        const fromSection = sections.find((s) => s.id === activeTask.status);
        setAnnouncement(`Task moved from ${fromSection?.title} to ${targetSection.title}`);
      } else {
        setAnnouncement(`Task dropped in ${targetSection.title}. No changes made.`);
      }
    } else {
      // Dropped on another task - handle reordering
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      if (activeTask.status === overTask.status) {
        // Reordering within the same section
        const sectionTasks = getTasksByStatus(activeTask.status);
        const oldIndex = sectionTasks.findIndex((t) => t.id === activeId);
        const newIndex = sectionTasks.findIndex((t) => t.id === overId);

        if (oldIndex !== newIndex) {
          const reordered = arrayMove(sectionTasks, oldIndex, newIndex);

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
          const section = sections.find((s) => s.id === activeTask.status);
          setAnnouncement(`Task reordered within ${section?.title}`);
        } else {
          setAnnouncement("Task position unchanged");
        }
      } else {
        // Moving to a different section
        const targetTasks = getTasksByStatus(overTask.status);
        const newIndex = targetTasks.findIndex((t) => t.id === overId);

        onMoveTask?.(activeId, overTask.status, newIndex);
        const fromSection = sections.find((s) => s.id === activeTask.status);
        const toSection = sections.find((s) => s.id === overTask.status);
        setAnnouncement(`Task moved from ${fromSection?.title} to ${toSection?.title}`);
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
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const sectionTasks = getTasksByStatus(section.id);
          const taskIds = sectionTasks.map((task) => task.id);

          return (
            <div key={section.id}>
              <DroppableListSection
                id={section.id}
                title={section.title}
                count={sectionTasks.length}
              >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                  {sectionTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-12 border border-dashed rounded-lg text-xs text-muted-foreground">
                      Drop tasks here
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden bg-card">
                      {sectionTasks.map((task, idx) => (
                        <DraggableTaskListItem
                          key={task.id}
                          task={task}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          isLast={idx === sectionTasks.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </DroppableListSection>

              {/* Separator between sections */}
              {index < sections.length - 1 && <Separator className="mt-4" />}
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeTask ? (
          <div className="bg-card border rounded-lg shadow-xl cursor-grabbing">
            <TaskListItem task={activeTask} isLast />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
