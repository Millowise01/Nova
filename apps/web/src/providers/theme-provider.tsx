"use client";

import type { ReactNode } from "react";

import { ThemeProvider as SharedThemeProvider, useTheme } from "@nova/app-shell";
import type { Theme } from "@nova/app-shell";

import { COOKIE_KEYS } from "@/config/app";

export { useTheme };
export type { Theme };

// The behaviour is shared (@nova/app-shell); this app only supplies its own storage key.
export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  return (
    <SharedThemeProvider storageKey={COOKIE_KEYS.theme} initialTheme={initialTheme}>
      {children}
    </SharedThemeProvider>
  );
}
