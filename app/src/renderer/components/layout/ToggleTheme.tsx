import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { toggleTheme } from "@/renderer/utils/theme-helpers";
import { useEffect, useState } from "react";

/**
 * ToggleTheme provides a button to switch between light and dark themes
 */
export function ToggleTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Set initial state based on current theme
    setIsDark(document.documentElement.classList.contains("dark"));

    // Add event listener to update button state when theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
