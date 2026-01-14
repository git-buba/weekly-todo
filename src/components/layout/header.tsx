"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { TaskSearch } from "./task-search";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "TODO", href: "/todo" },
  { name: "Report", href: "/todo/report" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between m-auto">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <CheckSquare className="h-6 w-6" />
            <span className="hidden sm:inline">Weekly TODO</span>
            <span className="sm:hidden">TODO</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-1" aria-label="Main navigation">
            {/* Navigation links - only show on Home page */}
            {pathname !== "/todo" && !pathname.startsWith("/todo/") && (
              <>
              </>
            )}

            {/* Search on TODO page */}
            {pathname === "/todo" && <TaskSearch />}

            {/* Report page indicator */}
            {pathname === "/todo/report" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
                <span>Weekly Report</span>
              </div>
            )}

            {/* Theme Toggle - always show */}
            <div className="ml-2 pl-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
