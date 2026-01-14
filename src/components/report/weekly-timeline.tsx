"use client";

import { Plus, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DailyReport, Task, WeekInfo } from "@/types/task";
import { isToday } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface WeeklyTimelineProps {
  dailyReports: DailyReport[];
  weekInfo: WeekInfo;
}

const priorityColors = {
  low: "text-blue-600 dark:text-blue-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  high: "text-orange-600 dark:text-orange-400",
  urgent: "text-red-600 dark:text-red-400",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function WeeklyTimeline({ dailyReports, weekInfo }: WeeklyTimelineProps) {
  return (
    <div className="space-y-0">
      {dailyReports.map((report, index) => (
        <TimelineDay
          key={report.date}
          report={report}
          isFirst={index === 0}
          isLast={index === dailyReports.length - 1}
        />
      ))}
    </div>
  );
}

interface TimelineDayProps {
  report: DailyReport;
  isFirst: boolean;
  isLast: boolean;
}

function TimelineDay({ report, isFirst, isLast }: TimelineDayProps) {
  const isCurrentDay = isToday(report.date);
  const hasActivity = report.createdTasks.length > 0 || report.completedTasks.length > 0;

  return (
    <div className="flex gap-4 relative">
      {/* Left side: Date indicator */}
      <div className="w-20 sm:w-24 shrink-0 pt-1">
        <div className={cn(isCurrentDay && "font-bold text-primary")}>
          <div className="text-sm font-medium">{report.dayOfWeek}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(report.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
          {isCurrentDay && (
            <Badge variant="default" className="text-xs mt-1">
              Today
            </Badge>
          )}
        </div>
      </div>

      {/* Timeline connector */}
      <div className="w-4 relative shrink-0 flex justify-center">
        {/* Vertical line - top portion */}
        {!isFirst && (
          <div className="absolute top-0 bottom-1/2 w-0.5 bg-border left-1/2 -translate-x-1/2" />
        )}
        {/* Vertical line - bottom portion */}
        {!isLast && (
          <div className="absolute top-1/2 bottom-0 w-0.5 bg-border left-1/2 -translate-x-1/2" />
        )}

        {/* Circle indicator */}
        <div
          className={cn(
            "absolute top-2 rounded-full border-2 border-background z-10",
            hasActivity ? "h-3 w-3 bg-primary" : "h-2 w-2 bg-muted",
            isCurrentDay && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        />
      </div>

      {/* Right side: Activities */}
      <div className="flex-1 pb-6 min-w-0">
        {hasActivity ? (
          <div className="space-y-3">
            {/* Created tasks */}
            {report.createdTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <Plus className="h-4 w-4" />
                  <span>Created ({report.createdTasks.length})</span>
                </div>
                <div className="space-y-1.5">
                  {report.createdTasks.map((task) => (
                    <TaskTimelineItem
                      key={task.id}
                      task={task}
                      type="created"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed tasks */}
            {report.completedTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completed ({report.completedTasks.length})</span>
                </div>
                <div className="space-y-1.5">
                  {report.completedTasks.map((task) => (
                    <TaskTimelineItem
                      key={task.id}
                      task={task}
                      type="completed"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic pt-1">
            No activity
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskTimelineItemProps {
  task: Task;
  type: "created" | "completed";
}

function TaskTimelineItem({ task, type }: TaskTimelineItemProps) {
  const timestamp = type === "completed" ? task.completedAt : task.createdAt;
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors",
        type === "completed" &&
          "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50"
      )}
    >
      {/* Time */}
      {time && (
        <div className="text-xs text-muted-foreground shrink-0 w-14 pt-0.5 hidden sm:block">
          {time}
        </div>
      )}

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm",
            type === "completed" && "line-through text-muted-foreground"
          )}
        >
          {task.content}
        </p>

        {/* Tags and priority */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className={cn("text-xs font-medium", priorityColors[task.priority])}>
            {priorityLabels[task.priority]}
          </span>
          {task.tags.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {task.tags.slice(0, 2).join(", ")}
              {task.tags.length > 2 && ` +${task.tags.length - 2}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
