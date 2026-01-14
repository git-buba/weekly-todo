"use client";

import { Plus, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyReport } from "@/types/task";
import { cn } from "@/lib/utils";
import { isToday } from "@/lib/date-utils";

interface DailyCardProps {
  report: DailyReport;
}

export function DailyCard({ report }: DailyCardProps) {
  const isCurrentDay = isToday(report.date);
  const totalActivity = report.createdTasks.length + report.completedTasks.length;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isCurrentDay && "border-primary shadow-sm"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {report.dayOfWeek}
          </CardTitle>
          {isCurrentDay && (
            <Badge variant="default" className="text-xs">
              Today
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(report.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Created Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4 text-blue-500" aria-hidden="true" />
            <span>Created ({report.createdTasks.length})</span>
          </div>
          {report.createdTasks.length > 0 ? (
            <ul className="space-y-1" aria-label={`${report.createdTasks.length} tasks created on ${report.dayOfWeek}`}>
              {report.createdTasks.map((task) => (
                <li
                  key={task.id}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <Circle className="h-3 w-3 mt-1 flex-shrink-0" aria-hidden="true" />
                  <span className="line-clamp-2">{task.content}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">No tasks created</p>
          )}
        </div>

        {/* Completed Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            <span>Completed ({report.completedTasks.length})</span>
          </div>
          {report.completedTasks.length > 0 ? (
            <ul className="space-y-1" aria-label={`${report.completedTasks.length} tasks completed on ${report.dayOfWeek}`}>
              {report.completedTasks.map((task) => (
                <li
                  key={task.id}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <CheckCircle2 className="h-3 w-3 mt-1 flex-shrink-0 text-green-500" aria-hidden="true" />
                  <span className="line-clamp-2 line-through">{task.content}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">No tasks completed</p>
          )}
        </div>

        {/* Activity Summary */}
        {totalActivity === 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground">No activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
