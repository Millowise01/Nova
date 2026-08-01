"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { themes, createTheme, type ThemeName } from "./index";

/** Widened theme shape — string values instead of literal types, safe for runtime merging. */
export type ThemeTokens = Record<string, string>;

interface ThemeContextValue {
  themeName: ThemeName | "custom";
  theme: ThemeTokens;
  setTheme: (name: ThemeName) => void;
  setCustomTheme: (overrides: Partial<ThemeTokens>) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  /** Seller / campaign / regional overrides applied on top of defaultTheme */
  overrides?: Partial<ThemeTokens>;
  /** CSS class target — defaults to document.documentElement */
  attribute?: "class" | "data-theme";
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  overrides,
  attribute = "class",
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const [customOverrides, setCustomOverrides] = useState<Partial<ThemeTokens> | undefined>(overrides);

  const baseTheme = themes[themeName] as ThemeTokens;
  const theme: ThemeTokens = customOverrides
    ? createTheme(customOverrides as Parameters<typeof createTheme>[0]) as ThemeTokens
    : baseTheme;

  useEffect(() => {
    const root = document.documentElement;
    if (attribute === "class") {
      root.classList.remove(...(Object.keys(themes) as ThemeName[]));
      if (themeName !== "light") root.classList.add(themeName);
    } else {
      root.setAttribute("data-theme", themeName);
    }
  }, [themeName, attribute]);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    setCustomOverrides(undefined);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeName: customOverrides ? "custom" : themeName,
        theme,
        setTheme,
        setCustomTheme: setCustomOverrides,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
