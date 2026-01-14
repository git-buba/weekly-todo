"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Task } from "@/types/task";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";

interface DraggableTaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export function DraggableTaskCard({ task, onEdit, onDelete }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="group"
      aria-label={`Draggable task: ${task.content.substring(0, 50)}${task.content.length > 50 ? "..." : ""}`}
      aria-describedby={`drag-instructions-${task.id}`}
      className={cn(
        "group relative touch-none",
        isDragging && "opacity-0 z-50"
      )}
    >
      {/* Screen reader instructions */}
      <span id={`drag-instructions-${task.id}`} className="sr-only">
        Use arrow keys to move this task between columns. Press Space to pick up, arrow keys to navigate, Space again to drop.
      </span>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "p-1 rounded hover:bg-accent z-10"
        )}
        role="button"
        tabIndex={0}
        aria-label={`Drag handle for task: ${task.content.substring(0, 30)}${task.content.length > 30 ? "..." : ""}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* Task Card */}
      <div className="pl-8">
        <TaskCard
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          isDragging={isDragging}
        />
      </div>
    </div>
  );
}
