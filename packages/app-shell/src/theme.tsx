"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ONE_YEAR_SECONDS = 31_536_000;

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  const active =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  root.classList.add(active);
}

/**
 * `storageKey` names both the cookie and the localStorage entry. It is a parameter because each
 * application keeps its own preference (cookies are not port-isolated on localhost).
 */
export function ThemeProvider({
  children,
  storageKey,
  initialTheme = "system",
}: {
  children: ReactNode;
  storageKey: string;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    document.cookie = `${storageKey}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    localStorage.setItem(storageKey, next);
  };

  // A saved preference wins over the initial one.
  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as Theme | null;
    setThemeState(saved || initialTheme);
  }, [storageKey, initialTheme]);

  // Apply the current theme, and follow the operating system only while it is "system". Keyed on
  // `theme` so the listener is dropped as soon as an explicit theme is chosen.
  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
