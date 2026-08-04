/**
 * Nova Brand Palette — primitive color scales.
 * Do not use these directly in components.
 * Reference semantic tokens via CSS vars or theme objects instead.
 */
export const colors = {
  /** Nova Primary Blue #0D2A63 — trust, navigation, headers, brand identity */
  navy: {
    50: "#e6edf7",
    100: "#ccdaef",
    200: "#99b5df",
    300: "#6690cf",
    400: "#336bbf",
    500: "#0D2A63",
    600: "#002258",
    700: "#001a44",
    800: "#001133",
    900: "#000922",
    950: "#000511",
  },
  /** Nova Orange #FF6A00 — CTAs, promotions, shopping actions */
  orange: {
    50: "#fff4ec",
    100: "#ffe8d9",
    200: "#ffd1b3",
    300: "#ffba8d",
    400: "#ffa366",
    500: "#FF6A00",
    600: "#e65f00",
    700: "#cc5400",
    800: "#b34900",
    900: "#803400",
    950: "#4d1f00",
  },
  /** Light Orange #FFC8A3 — soft surfaces, promotional backgrounds */
  peach: {
    50: "#fff9f5",
    100: "#fff3eb",
    200: "#ffe7d6",
    300: "#ffdbc2",
    400: "#ffd4b8",
    500: "#FFC8A3",
    600: "#ffb380",
    700: "#ff9e5d",
    800: "#ff893a",
    900: "#ff7417",
  },
  /** Accent Blue #1A56DB — links, info states, interactive elements */
  blue: {
    50: "#eef3fd",
    100: "#dde7fb",
    200: "#bbcff7",
    300: "#99b7f3",
    400: "#779fef",
    500: "#1A56DB",
    600: "#174dc5",
    700: "#1344af",
    800: "#103b99",
    900: "#0c2d73",
    950: "#081e4d",
  },
  /**
   * Neutral scale — Phase 2 Enterprise Design System semantic palette.
   * 0 and 950 are extensions beyond the approved 100-900 scale (kept for
   * pure-white and deep-background use cases the source spec doesn't cover).
   * Neutral 300 is used as printed in the source image — the digit sequence
   * differs from Slate-200 in more than one position, so unlike 400/500/800
   * (single-character "B read as 8" cases) it was not assumed to be a
   * transcription of a known palette. Confirm against source if available.
   * 900 uses the source's separately-labeled "Neutral Dark" brand color
   * (#111827, RGB given explicitly) rather than the Semantic Palette row's
   * own "Neutral 900" swatch (#0F172A) — the two are ~2-17 RGB units apart
   * per channel and treated as the same intended value here, not two tokens.
   */
  neutral: {
    0: "#ffffff",
    100: "#F8FAFC",
    200: "#F1F5F9",
    300: "#E2E6E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#111827",
    950: "#030712",
  },
  /** Success — Green */
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  /** Warning — Amber */
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  /** Error — Red */
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
} as const;

export type ColorScale = typeof colors;
export type ColorName = keyof ColorScale;
