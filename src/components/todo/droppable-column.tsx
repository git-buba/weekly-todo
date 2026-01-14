"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableColumnProps {
  id: string;
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}

export function DroppableColumn({
  id,
  title,
  description,
  count,
  children,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <section
      ref={setNodeRef}
      role="region"
      aria-label={`${title} column with ${count} ${count === 1 ? "task" : "tasks"}`}
      className={cn(
        "flex flex-col rounded-lg p-4 min-h-[500px] transition-all",
        isOver
          ? "bg-primary/5 border border-primary shadow-lg scale-[1.02]"
          : "bg-muted/30"
      )}
    >
      {/* Column Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground" aria-label={`${count} ${count === 1 ? "task" : "tasks"} in this column`}>
            {count} {count === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      {children}
    </section>
  );
}
