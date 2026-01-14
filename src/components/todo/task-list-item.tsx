"use client";

import { Calendar, Clock, MoreVertical, Tag } from "lucide-react";
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

interface TaskListItemProps {
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

export function TaskListItem({
  task,
  onEdit,
  onDelete,
  isLast = false,
}: TaskListItemProps) {
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
      data-task-id={task.id}
      className={cn(
        "group flex items-center gap-3 py-2.5 px-3 hover:bg-accent/50 transition-colors transition-[background-color,ring]",
        !isLast && "border-b",
        isOverdue && "bg-destructive/5"
      )}
    >
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
  );
}
