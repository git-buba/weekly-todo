"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { WeekNavigation } from "@/components/report/week-navigation";
import { WeeklyTimeline } from "@/components/report/weekly-timeline";
import { IncompleteSection } from "@/components/report/incomplete-section";
import { useTaskStore } from "@/store/task-store";
import { useFilterStore } from "@/store/filter-store";
import { generateWeeklyReport } from "@/lib/filter-utils";
import { getCurrentWeekInfo } from "@/lib/date-utils";

export default function ReportPage() {
  const [isClient, setIsClient] = useState(false);
  const { tasks, isLoading, initialize } = useTaskStore();
  const { selectedWeek, setSelectedWeek, navigateWeek, goToCurrentWeek } = useFilterStore();

  // Initialize store on mount
  useEffect(() => {
    setIsClient(true);
    initialize();
  }, [initialize]);

  // Generate weekly report
  const weeklyReport = isClient ? generateWeeklyReport(tasks, selectedWeek) : null;

  const handlePrevious = () => navigateWeek("prev");
  const handleNext = () => navigateWeek("next");
  const handleToday = () => {
    const currentWeek = getCurrentWeekInfo();
    setSelectedWeek(currentWeek);
  };

  // Show loading state
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 m-auto" id="main-content">
          <div className="flex items-center justify-center h-64" role="status" aria-live="polite" aria-label="Loading report">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-6 space-y-6 m-auto" id="main-content">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Weekly Report</h1>
              <p className="text-muted-foreground">
                Track your productivity and task completion
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href="/todo">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to TODO
            </Link>
          </Button>
        </div>

        {/* Week Navigation */}
        <WeekNavigation
          weekInfo={selectedWeek}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64" role="status" aria-live="polite" aria-label="Loading weekly report">
            <div className="text-muted-foreground">Loading report...</div>
          </div>
        ) : weeklyReport ? (
          <>
            {/* Weekly Timeline */}
            <section aria-labelledby="daily-activity-heading">
              <h2 id="daily-activity-heading" className="text-xl font-semibold mb-4">Weekly Timeline</h2>
              <WeeklyTimeline
                dailyReports={weeklyReport.dailyReports}
                weekInfo={weeklyReport.weekInfo}
              />
            </section>

            <Separator className="my-6" />

            {/* Incomplete Tasks Section */}
            <section aria-labelledby="incomplete-tasks-heading">
              <h2 id="incomplete-tasks-heading" className="text-xl font-semibold mb-4">Incomplete Tasks Overview</h2>
              <IncompleteSection
                upcoming={weeklyReport.incompleteTasks.upcoming}
                inProgress={weeklyReport.incompleteTasks.inProgress}
                onHold={weeklyReport.incompleteTasks.onHold}
              />
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
