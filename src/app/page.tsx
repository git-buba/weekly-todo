import Link from "next/link";
import { CheckSquare, Calendar, LayoutGrid, List, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1" id="main-content">
        {/* Hero Section */}
        <section className="container py-12 md:py-24 lg:py-32 m-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Weekly TODO
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                Manage your tasks efficiently with ISO 8601 week-based filtering.
                <br />
                Simple, clean, and focused on what matters.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/todo">
                  <CheckSquare className="mr-2 h-5 w-5" aria-hidden="true" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/todo/report">
                  <TrendingUp className="mr-2 h-5 w-5" aria-hidden="true" />
                  View Reports
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-12 bg-muted/50 m-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Features
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              Everything you need to organize your weekly tasks
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-12">
            {/* Feature 1: Kanban Board */}
            <Card>
              <CardHeader>
                <LayoutGrid className="h-10 w-10 mb-2 text-primary" aria-hidden="true" />
                <CardTitle>Kanban Board</CardTitle>
                <CardDescription>
                  Visual task management with drag and drop
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Organize tasks across 4 columns: Upcoming, In Progress, Completed, and On Hold.
              </CardContent>
            </Card>

            {/* Feature 2: List View */}
            <Card>
              <CardHeader>
                <List className="h-10 w-10 mb-2 text-primary" aria-hidden="true" />
                <CardTitle>List View</CardTitle>
                <CardDescription>
                  Alternative compact view for your tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Switch between Kanban and List views based on your preference.
              </CardContent>
            </Card>

            {/* Feature 3: Weekly Filter */}
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 mb-2 text-primary" aria-hidden="true" />
                <CardTitle>Weekly Filter</CardTitle>
                <CardDescription>
                  ISO 8601 week-based task filtering
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Filter tasks by This Week, Last Week, Next Week, or view All tasks.
              </CardContent>
            </Card>

            {/* Feature 4: Weekly Reports */}
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-primary" aria-hidden="true" />
                <CardTitle>Weekly Reports</CardTitle>
                <CardDescription>
                  Track your productivity over time
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Daily breakdown of created and completed tasks with incomplete task overview.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-12 md:py-24 m-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to get organized?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Start managing your tasks by week. No login required to get started.
              </p>
            </div>

            <Button asChild size="lg">
              <Link href="/todo">
                Start Using Weekly TODO
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 w-full">
        <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground m-auto">
          <p>© 2026 Weekly TODO. Built with Next.js and shadcn/ui.</p>
          <div className="flex gap-4">
            <span>Light/Dark Theme</span>
            <span>•</span>
            <span>Responsive Design</span>
            <span>•</span>
            <span>Accessibility First</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
