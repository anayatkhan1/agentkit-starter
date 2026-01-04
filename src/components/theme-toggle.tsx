"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";


export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center p-1 rounded-full border bg-background w-fit">
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 cursor-pointer rounded-full transition-all ${
          theme === "system" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="System theme"
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
            <Monitor className="w-4 h-4" />
        </div>
      </button>
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 cursor-pointer rounded-full transition-all ${
          theme === "light" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Light theme"
      >
         <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 cursor-pointer rounded-full transition-all ${
          theme === "dark" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Dark theme"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
