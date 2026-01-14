"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableListSectionProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export function DroppableListSection({
  id,
  title,
  count,
  children,
}: DroppableListSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={`${title} section with ${count} ${count === 1 ? "task" : "tasks"}`}
      className={cn(
        "transition-all rounded-lg",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Section Header */}
      <div className="mb-2 px-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? "task" : "tasks"}
        </p>
      </div>

      {/* Tasks */}
      {children}
    </div>
  );
}
