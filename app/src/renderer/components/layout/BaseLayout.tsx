import React from "react";
import { DragWindowRegion } from "./DragWindowRegion";
import { Sidebar } from "./sidebar";
import { ThemeProvider } from "./ThemeProvider";
import { ToggleTheme } from "./ToggleTheme";

interface BaseLayoutProps {
  children: React.ReactNode;
}

/**
 * BaseLayout is the main layout component for the application
 * It includes the drag region, sidebar, and main content area
 */
export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <DragWindowRegion title="Convoy" />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="flex h-12 items-center justify-end border-b px-4">
              <ToggleTheme />
            </header>
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
