import { lightTheme, type LightTheme } from "./light";
import { darkTheme,  type DarkTheme  } from "./dark";

export { ThemeProvider, useTheme } from "./provider";

export { lightTheme, darkTheme };
export type { LightTheme, DarkTheme };

/**
 * ThemeContract — the full set of tokens every theme must provide.
 * Derive from the light theme (canonical shape).
 * Custom themes (seller branding, campaigns, regional) must satisfy this type.
 *
 * @example
 *   const sellerTheme: ThemeContract = {
 *     ...lightTheme,
 *     primary:           "#7c3aed",
 *     primaryHover:      "#6d28d9",
 *     // ... override only what differs
 *   };
 */
export type ThemeContract = LightTheme;

/**
 * Built-in named themes.
 */
export const themes = {
  light: lightTheme,
  dark:  darkTheme,
} as const;

export type ThemeName = keyof typeof themes;

/**
 * createTheme — merge a partial override onto the light theme base.
 * Use for seller branding, campaign themes, and regional variants.
 *
 * @example
 *   const ramadanTheme = createTheme({
 *     primary:       "#7c3aed",
 *     primaryHover:  "#6d28d9",
 *     accent:        "#f59e0b",
 *   });
 */
export function createTheme(overrides: Partial<ThemeContract>): ThemeContract {
  return { ...lightTheme, ...overrides };
}
