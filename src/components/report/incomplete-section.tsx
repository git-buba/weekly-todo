"use client";

import { AlertCircle, Clock, Pause } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface IncompleteSectionProps {
  upcoming: Task[];
  inProgress: Task[];
  onHold: Task[];
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const priorityLabels = {
  low: "Low",
  medium: "Med",
  high: "High",
  urgent: "Urgent",
};

export function IncompleteSection({ upcoming, inProgress, onHold }: IncompleteSectionProps) {
  const totalIncomplete = upcoming.length + inProgress.length + onHold.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" aria-hidden="true" />
              Incomplete Tasks
            </CardTitle>
            <CardDescription>
              Tasks that need attention (all weeks)
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-semibold" aria-label={`${totalIncomplete} incomplete tasks`}>
            {totalIncomplete}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {totalIncomplete === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">All tasks completed! 🎉</p>
          </div>
        ) : (
          <>
            {/* Upcoming Tasks */}
            {upcoming.length > 0 && (
              <section className="space-y-3" aria-labelledby="upcoming-heading">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  <h4 id="upcoming-heading" className="font-semibold text-sm">Upcoming ({upcoming.length})</h4>
                </div>
                <ul className="space-y-2" aria-label={`${upcoming.length} upcoming tasks`}>
                  {upcoming.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded-md border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm">{task.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                            {priorityLabels[task.priority]}
                          </Badge>
                          {task.tags.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {task.tags.slice(0, 2).join(", ")}
                              {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Separator */}
            {upcoming.length > 0 && (inProgress.length > 0 || onHold.length > 0) && (
              <Separator />
            )}

            {/* In Progress Tasks */}
            {inProgress.length > 0 && (
              <section className="space-y-3" aria-labelledby="in-progress-heading">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center" aria-hidden="true">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <h4 id="in-progress-heading" className="font-semibold text-sm">In Progress ({inProgress.length})</h4>
                </div>
                <ul className="space-y-2" aria-label={`${inProgress.length} tasks in progress`}>
                  {inProgress.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded-md border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                            {priorityLabels[task.priority]}
                          </Badge>
                          {task.tags.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {task.tags.slice(0, 2).join(", ")}
                              {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Separator */}
            {inProgress.length > 0 && onHold.length > 0 && <Separator />}

            {/* On Hold Tasks */}
            {onHold.length > 0 && (
              <section className="space-y-3" aria-labelledby="on-hold-heading">
                <div className="flex items-center gap-2">
                  <Pause className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  <h4 id="on-hold-heading" className="font-semibold text-sm">On Hold ({onHold.length})</h4>
                </div>
                <ul className="space-y-2" aria-label={`${onHold.length} tasks on hold`}>
                  {onHold.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded-md border bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{task.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                            {priorityLabels[task.priority]}
                          </Badge>
                          {task.tags.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {task.tags.slice(0, 2).join(", ")}
                              {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
