"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/store/filter-store";
import { WeekFilter } from "@/types/filter";
import { formatWeekRange } from "@/lib/date-utils";

const weekFilterOptions: { value: WeekFilter; label: string }[] = [
  { value: "this-week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
  { value: "next-week", label: "Next Week" },
  { value: "all", label: "All Weeks" },
];

export function WeekSelector() {
  const { weekFilter, selectedWeek, setWeekFilter } = useFilterStore();

  const selectedOption = weekFilterOptions.find((opt) => opt.value === weekFilter);
  const weekRangeText = weekFilter !== "all" ? formatWeekRange(selectedWeek) : "All time";

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Select value={weekFilter} onValueChange={(value) => setWeekFilter(value as WeekFilter)}>
          <SelectTrigger className="w-[140px]" aria-label="Select week filter">
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            {weekFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground hidden sm:inline" aria-live="polite">
          {weekRangeText}
        </span>
      </div>
    </div>
  );
}
