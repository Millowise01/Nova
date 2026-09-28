"use client";

import { Switch } from "@nova/ui";

import { useTheme } from "@/providers/theme-provider";

/** Real, working toggle (W-13) — @nova/app-shell's ThemeProvider is already mounted and
 *  already persists light/dark to a cookie + localStorage (see providers/theme-provider.tsx
 *  and Phase 5's app-shell work); this was the one Settings card that had a real
 *  capability sitting behind it but no UI to reach it. A plain on/off switch matches the
 *  "Dark Mode" card exactly — it doesn't expose "system" here, which stays the default
 *  until a theme is explicitly chosen. */
export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Switch
      checked={theme === "dark"}
      onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
      label="Dark Mode"
      description="Switch between light and dark appearance."
    />
  );
}
