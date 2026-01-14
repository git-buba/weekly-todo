"use client";

import { Calendar, Tag, MoreVertical, Clock } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskStore } from "@/store/task-store";
import { formatDate, isPast, isToday, isTomorrow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  isDragging?: boolean;
  showCheckbox?: boolean;
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

export function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging = false,
  showCheckbox = true
}: TaskCardProps) {
  const isOverdue = task.deadline && task.status !== "completed" && isPast(task.deadline);
  const isDueToday = task.deadline && isToday(task.deadline);
  const isDueTomorrow = task.deadline && isTomorrow(task.deadline);

  // Zustand store for task updates
  const updateTask = useTaskStore((state) => state.updateTask);

  // Checkbox only shown for in-progress and completed tasks
  const canToggleStatus = task.status === "in-progress" || task.status === "completed";
  const isChecked = task.status === "completed";

  const handleCheckboxChange = (checked: boolean) => {
    const newStatus = checked ? "completed" : "in-progress";
    updateTask(task.id, {
      status: newStatus,
      completedAt: checked ? new Date().toISOString() : null
    });
  };

  const getDeadlineText = () => {
    if (!task.deadline) return null;
    if (isDueToday) return "Due today";
    if (isDueTomorrow) return "Due tomorrow";
    return formatDate(task.deadline);
  };

  return (
    <Card
      data-task-id={task.id}
      className={cn(
        "group hover:shadow-md transition-shadow transition-[box-shadow,ring]",
        isDragging && "opacity-50 rotate-2",
        isOverdue && "border-destructive"
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          {/* Checkbox - only for in-progress and completed */}
          {showCheckbox && canToggleStatus && (
            <Checkbox
              checked={isChecked}
              onCheckedChange={handleCheckboxChange}
              aria-label={`Mark task as ${isChecked ? "in progress" : "completed"}`}
              className="mt-0.5"
            />
          )}

          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium leading-snug font-sans">{task.content}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                {priorityLabels[task.priority]}
              </Badge>
              {task.deadline && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
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
                  <span>{getDeadlineText()}</span>
                </div>
              )}
            </div>
          </div>
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Options for task: ${task.content.substring(0, 30)}${task.content.length > 30 ? "..." : ""}`}
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
      </CardHeader>
      {task.tags.length > 0 && (
        <CardContent className={cn("pt-0", showCheckbox && canToggleStatus && "pl-10")}>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Task tags">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs" role="listitem">
                <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
