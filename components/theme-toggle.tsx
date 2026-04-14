"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/providers/custom-theme-provider";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Sun className="size-4 text-muted-foreground" />
        <div className="h-6 w-11 rounded-full bg-muted" />
        <Moon className="size-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="size-4 text-muted-foreground" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={() => toggleTheme()}
        aria-label="Toggle theme"
      />
      <Moon className="size-4 text-muted-foreground" />
    </div>
  );
}
