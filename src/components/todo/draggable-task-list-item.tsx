"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, Clock, MoreVertical, Tag } from "lucide-react";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskStore } from "@/store/task-store";
import { formatDate, isPast, isToday, isTomorrow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface DraggableTaskListItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  isLast?: boolean;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function DraggableTaskListItem({
  task,
  onEdit,
  onDelete,
  isLast = false,
}: DraggableTaskListItemProps) {
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

  const isOverdue = task.deadline && task.status !== "completed" && isPast(task.deadline);
  const isDueToday = task.deadline && isToday(task.deadline);
  const isDueTomorrow = task.deadline && isTomorrow(task.deadline);

  const updateTask = useTaskStore((state) => state.updateTask);

  const canToggleStatus = task.status === "in-progress" || task.status === "completed";
  const isChecked = task.status === "completed";

  const handleCheckboxChange = (checked: boolean) => {
    const newStatus = checked ? "completed" : "in-progress";
    updateTask(task.id, {
      status: newStatus,
      completedAt: checked ? new Date().toISOString() : null,
    });
  };

  const getDeadlineText = () => {
    if (!task.deadline) return null;
    if (isDueToday) return "Today";
    if (isDueTomorrow) return "Tomorrow";
    return formatDate(task.deadline);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative touch-none",
        isDragging && "opacity-50 z-50"
      )}
    >
      <span className="sr-only">
        Use arrow keys to move this task between sections. Press Space to pick up, arrow keys to navigate, Space again to drop.
      </span>

      <div
        className={cn(
          "flex items-center gap-3 py-2.5 px-3 hover:bg-accent/50 transition-colors",
          !isLast && "border-b",
          isOverdue && "bg-destructive/5"
        )}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing shrink-0",
            "p-1 rounded hover:bg-accent"
          )}
          role="button"
          tabIndex={0}
          aria-label={`Drag handle for task: ${task.content.substring(0, 30)}${task.content.length > 30 ? "..." : ""}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>

        {/* Checkbox */}
        {canToggleStatus && (
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Mark task as ${isChecked ? "in progress" : "completed"}`}
            className="shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm truncate",
              isChecked && "line-through text-muted-foreground"
            )}
          >
            {task.content}
          </p>
        </div>

        {/* Priority Badge */}
        <Badge
          variant="outline"
          className={cn("text-xs shrink-0 hidden sm:flex", priorityColors[task.priority])}
        >
          {priorityLabels[task.priority]}
        </Badge>

        {/* Deadline */}
        {task.deadline && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs shrink-0",
              isOverdue
                ? "text-destructive font-medium"
                : isDueToday
                ? "text-orange-600 dark:text-orange-400 font-medium"
                : "text-muted-foreground"
            )}
          >
            {isOverdue ? (
              <Clock className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Calendar className="h-3 w-3" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{getDeadlineText()}</span>
          </div>
        )}

        {/* Tags count */}
        {task.tags.length > 0 && (
          <Badge variant="secondary" className="text-xs shrink-0 hidden md:flex">
            <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
            {task.tags.length}
          </Badge>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={`Options for task: ${task.content.substring(0, 30)}${
                  task.content.length > 30 ? "..." : ""
                }`}
              >
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
