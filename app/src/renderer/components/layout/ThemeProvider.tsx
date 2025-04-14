import React, { useEffect } from "react";
import { initializeTheme } from "@/renderer/utils/theme-helpers";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider initializes and manages the application's theme
 * It ensures the correct theme is applied based on user preference
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme on component mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return <>{children}</>;
}
