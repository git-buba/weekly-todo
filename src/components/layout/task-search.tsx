"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/store/task-store";
import { useFilterStore } from "@/store/filter-store";
import { useDebounce } from "@/hooks/use-debounce";
import { Task, TaskStatus } from "@/types/task";
import { getWeekInfo } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<TaskStatus, string> = {
  upcoming: "Upcoming",
  "in-progress": "In Progress",
  completed: "Completed",
  "on-hold": "On Hold",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "on-hold": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export function TaskSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const tasks = useTaskStore((state) => state.tasks);
  const setSelectedWeek = useFilterStore((state) => state.setSelectedWeek);

  // Filter tasks based on debounced query
  const filteredTasks = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const lowerQuery = debouncedQuery.toLowerCase();
    return tasks.filter((task) => {
      const contentMatch = task.content.toLowerCase().includes(lowerQuery);
      const tagMatch = task.tags.some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );
      return contentMatch || tagMatch;
    });
  }, [debouncedQuery, tasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredTasks.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || filteredTasks.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredTasks.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredTasks.length) {
            handleTaskSelect(filteredTasks[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setQuery("");
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, filteredTasks, selectedIndex]
  );

  const highlightTask = useCallback((taskId: string) => {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
      taskElement.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(() => {
        taskElement.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 2000);
    }
  }, []);

  const handleTaskSelect = (task: Task) => {
    setIsOpen(false);
    setQuery("");

    // If task is completed, navigate to the week it was created
    if (task.status === "completed") {
      const createdWeek = getWeekInfo(new Date(task.createdAt));
      setSelectedWeek(createdWeek);
      // Wait for re-render then highlight
      setTimeout(() => highlightTask(task.id), 100);
    } else {
      // Task is not completed, just highlight it
      highlightTask(task.id);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-8 h-9 w-[200px] sm:w-[260px]"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 p-1 hover:bg-muted rounded"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && debouncedQuery.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-1 w-[320px] sm:w-[400px] right-0 bg-popover border rounded-md shadow-lg z-[60] max-h-[400px] overflow-auto"
        >
          {filteredTasks.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tasks found for &quot;{debouncedQuery}&quot;
            </div>
          ) : (
            <div className="py-1">
              <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
              </div>
              {filteredTasks.map((task, index) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskSelect(task)}
                  className={cn(
                    "w-full text-left px-3 py-2 hover:bg-muted transition-colors",
                    selectedIndex === index && "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5",
                        STATUS_COLORS[task.status]
                      )}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">
                        {highlightMatch(task.content, debouncedQuery)}
                      </p>
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded"
                            >
                              {highlightMatch(tag, debouncedQuery)}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
