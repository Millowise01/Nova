"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { COOKIE_KEYS } from "@/config/app";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = "system",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.cookie = `${COOKIE_KEYS.theme}=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem(COOKIE_KEYS.theme, newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (t: Theme) => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let activeTheme = t;
    if (t === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    root.classList.add(activeTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem(COOKIE_KEYS.theme) as Theme | null;
    const currentTheme = savedTheme || initialTheme;
    setThemeState(currentTheme);
    applyTheme(currentTheme);

    if (currentTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme("system");
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [initialTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
