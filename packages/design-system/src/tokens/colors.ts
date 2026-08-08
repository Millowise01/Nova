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
  /**
   * Success — Green, anchored on approved brand value #16A34A.
   * Previously this scale was the *unmodified* stock Tailwind `green`
   * palette (50–900), with the brand color sitting at the 600 step and a
   * wrong Tailwind default (#22c55e) squatting at 500. Regenerated here so
   * the brand anchor is correctly at 500: H/S held constant at the anchor's
   * HSL values, L stepped per-fraction using the pattern derived from this
   * file's orange/blue scales (the two scales that hold S constant across
   * their ramp — navy varies S too and looks hand-transcribed, not
   * generated, so it wasn't used as the reference).
   */
  green: {
    50: "#eafcf1",
    100: "#d5f9e2",
    200: "#abf4c6",
    300: "#81eea9",
    400: "#57e88d",
    500: "#16A34A",
    600: "#149343",
    700: "#12823b",
    800: "#0f7134",
    900: "#0b5326",
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
  /**
   * Error — Red, anchored on approved brand value #DC2626.
   * Same situation as green above: this was the unmodified stock Tailwind
   * `red` palette, brand color at 600, wrong default (#ef4444) at 500.
   * Regenerated with the same method (constant H/S, fractional L stepping
   * from the orange/blue reference pattern).
   */
  red: {
    50: "#fcefef",
    100: "#fadfdf",
    200: "#f5c0c0",
    300: "#f0a0a0",
    400: "#ea8080",
    500: "#DC2626",
    600: "#c82020",
    700: "#b11d1d",
    800: "#9b1919",
    900: "#711212",
  },
  /**
   * Info — #2563EB. Distinct from Accent Blue (`blue.500` = #1A56DB) per
   * the Phase 2 Semantic Palette — these are two separate brand blues with
   * different roles (info state vs. links/interactive elements), not a
   * duplicate. Did not previously exist as a token scale; theme files were
   * hand-authoring info states from stock Tailwind blue. Generated with the
   * same constant-H/S, fractional-L method used for green/red above.
   */
  info: {
    50: "#eff4fe",
    100: "#dfe8fc",
    200: "#bfd1f9",
    300: "#9fbaf6",
    400: "#7fa3f3",
    500: "#2563EB",
    600: "#1554e0",
    700: "#124bc6",
    800: "#1041ad",
    900: "#0c307f",
  },
} as const;

export type ColorScale = typeof colors;
export type ColorName = keyof ColorScale;
