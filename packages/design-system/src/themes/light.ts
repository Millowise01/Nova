/**
 * Nova Light Theme
 * Default Nova experience — clean, professional, high-trust.
 *
 * Covers: backgrounds, surfaces, cards, text hierarchy,
 * borders, inputs, buttons, navigation, and all semantic roles.
 */
export const lightTheme = {
  /* ── Backgrounds & Surfaces ──────────────────────────────── */
  /** Page background */
  background: "#ffffff",
  /** Default surface (cards, panels, sidebars) */
  surface: "#F8FAFC",
  /** Elevated surface (dropdowns, popovers, modals) */
  surfaceRaised: "#ffffff",
  /** Scrim / backdrop overlay */
  surfaceOverlay: "rgba(255, 255, 255, 0.92)",
  /** Navigation background */
  surfaceNav: "#0D2A63",
  /** Footer background */
  surfaceFooter: "#111827",

  /* ── Foreground / Text ───────────────────────────────────── */
  /** Primary body text */
  foreground: "#111827",
  /** Secondary / supporting text */
  foregroundMuted: "#475569",
  /** Placeholder, disabled, hint text */
  foregroundSubtle: "#94A3B8",
  /** Text on primary-colored backgrounds */
  foregroundOnPrimary: "#ffffff",
  /** Text on accent-colored backgrounds */
  foregroundOnAccent: "#ffffff",
  /** Text on dark surfaces (nav, footer) */
  foregroundOnDark: "#F8FAFC",

  /* ── Borders ─────────────────────────────────────────────── */
  /** Default border — inputs, cards, dividers */
  border: "#F1F5F9",
  /** Stronger border — focused inputs, active states */
  borderStrong: "#E2E6E1",
  /** Input border */
  borderInput: "#E2E6E1",
  /** Focused input border */
  borderFocus: "#1A56DB",

  /* ── Muted / Disabled ────────────────────────────────────── */
  muted: "#F8FAFC",
  mutedForeground: "#64748B",
  disabled: "#F1F5F9",
  disabledForeground: "#94A3B8",

  /* ── Primary — Nova Primary Blue #0D2A63 ──────────────────── */
  primary: "#0D2A63",
  primaryHover: "#0D2258",
  primaryActive: "#0D1A44",
  primaryDisabled: "#99b5df",
  primarySubtle: "#e6edf7",
  primaryForeground: "#ffffff",
  primaryBorder: "#6690cf",

  /* ── Secondary — Light Navy surface ─────────────────────── */
  secondary: "#e6edf7",
  secondaryHover: "#ccdaef",
  secondaryActive: "#99b5df",
  secondaryDisabled: "#f3f6fb",
  secondaryForeground: "#0D2A63",
  secondaryBorder: "#99b5df",

  /* ── Accent — Nova Orange #FF6A00 ────────────────────────── */
  accent: "#FF6A00",
  accentHover: "#e65f00",
  accentActive: "#cc5400",
  accentDisabled: "#ffd1b3",
  accentSubtle: "#fff4ec",
  accentForeground: "#ffffff",
  accentBorder: "#ffa366",

  /* ── Success — Nova Green #16A34A ─────────────────────────── */
  success: "#16A34A",
  successHover: "#149343",
  successActive: "#12823b",
  successDisabled: "#abf4c6",
  successSubtle: "#eafcf1",
  successForeground: "#ffffff",
  successBorder: "#81eea9",

  /* ── Warning ─────────────────────────────────────────────── */
  warning: "#d97706",
  warningHover: "#b45309",
  warningActive: "#92400e",
  warningDisabled: "#fde68a",
  warningSubtle: "#fffbeb",
  warningForeground: "#ffffff",
  warningBorder: "#fcd34d",

  /* ── Error — Nova Red #DC2626 ──────────────────────────────── */
  error: "#DC2626",
  errorHover: "#c82020",
  errorActive: "#b11d1d",
  errorDisabled: "#f5c0c0",
  errorSubtle: "#fcefef",
  errorForeground: "#ffffff",
  errorBorder: "#f0a0a0",

  /**
   * Info — #2563EB, distinct from Accent Blue #1A56DB per the Phase 2 spec's
   * Semantic Palette (they're two separate brand blues, not the same role).
   * Now backed by `colors.info` in tokens/colors.ts — hover/active/disabled/
   * subtle/border pull from that generated scale (600/700/200/50/300),
   * matching the same mapping used for success/error above.
   */
  info: "#2563EB",
  infoHover: "#1554e0",
  infoActive: "#124bc6",
  infoDisabled: "#bfd1f9",
  infoSubtle: "#eff4fe",
  infoForeground: "#ffffff",
  infoBorder: "#9fbaf6",
} as const;

export type LightTheme = typeof lightTheme;
