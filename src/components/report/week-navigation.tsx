"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeekRange, formatISOWeek } from "@/lib/date-utils";
import { WeekInfo } from "@/types/task";

interface WeekNavigationProps {
  weekInfo: WeekInfo;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekNavigation({ weekInfo, onPrevious, onNext, onToday }: WeekNavigationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-lg">{formatWeekRange(weekInfo)}</h3>
          <p className="text-xs text-muted-foreground">{formatISOWeek(weekInfo)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          aria-label="Go to current week"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          aria-label="Next week"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
