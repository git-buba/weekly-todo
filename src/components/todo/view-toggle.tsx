"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/filter-store";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const { viewMode, setViewMode } = useFilterStore();

  return (
    <div className="flex items-center gap-1 border rounded-lg p-1" role="tablist" aria-label="View mode">
      <Button
        variant={viewMode === "kanban" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setViewMode("kanban")}
        className={cn("gap-2", viewMode === "kanban" && "shadow-sm")}
        role="tab"
        aria-selected={viewMode === "kanban"}
        aria-label="Kanban view"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Kanban</span>
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setViewMode("list")}
        className={cn("gap-2", viewMode === "list" && "shadow-sm")}
        role="tab"
        aria-selected={viewMode === "list"}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
}
