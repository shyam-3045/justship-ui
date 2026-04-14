"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const STORAGE_KEY = "justship-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark so every page starts in the same black theme.
  const [theme, setTheme] = useState<Theme>("dark");

  const applyTheme = (newTheme: Theme) => {
    const htmlElement = document.documentElement;

    if (newTheme === "dark") htmlElement.classList.add("dark");
    else htmlElement.classList.remove("dark");

    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  useEffect(() => {
    const savedThemeRaw = localStorage.getItem(STORAGE_KEY);
    const initialTheme: Theme = isTheme(savedThemeRaw) ? savedThemeRaw : "dark";

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
