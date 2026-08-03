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
  surface: "#f9fafb",
  /** Elevated surface (dropdowns, popovers, modals) */
  surfaceRaised: "#ffffff",
  /** Scrim / backdrop overlay */
  surfaceOverlay: "rgba(255, 255, 255, 0.92)",
  /** Navigation background */
  surfaceNav: "#002A63",
  /** Footer background */
  surfaceFooter: "#111827",

  /* ── Foreground / Text ───────────────────────────────────── */
  /** Primary body text */
  foreground: "#111827",
  /** Secondary / supporting text */
  foregroundMuted: "#4b5563",
  /** Placeholder, disabled, hint text */
  foregroundSubtle: "#9ca3af",
  /** Text on primary-colored backgrounds */
  foregroundOnPrimary: "#ffffff",
  /** Text on accent-colored backgrounds */
  foregroundOnAccent: "#ffffff",
  /** Text on dark surfaces (nav, footer) */
  foregroundOnDark: "#f9fafb",

  /* ── Borders ─────────────────────────────────────────────── */
  /** Default border — inputs, cards, dividers */
  border: "#e5e7eb",
  /** Stronger border — focused inputs, active states */
  borderStrong: "#d1d5db",
  /** Input border */
  borderInput: "#d1d5db",
  /** Focused input border */
  borderFocus: "#1A56DB",

  /* ── Muted / Disabled ────────────────────────────────────── */
  muted: "#f3f4f6",
  mutedForeground: "#6b7280",
  disabled: "#e5e7eb",
  disabledForeground: "#9ca3af",

  /* ── Primary — Nova Navy #002A63 ─────────────────────────── */
  primary: "#002A63",
  primaryHover: "#002258",
  primaryActive: "#001a44",
  primaryDisabled: "#99b5df",
  primarySubtle: "#e6edf7",
  primaryForeground: "#ffffff",
  primaryBorder: "#6690cf",

  /* ── Secondary — Light Navy surface ─────────────────────── */
  secondary: "#e6edf7",
  secondaryHover: "#ccdaef",
  secondaryActive: "#99b5df",
  secondaryDisabled: "#f3f6fb",
  secondaryForeground: "#002A63",
  secondaryBorder: "#99b5df",

  /* ── Accent — Nova Orange #FF6A00 ────────────────────────── */
  accent: "#FF6A00",
  accentHover: "#e65f00",
  accentActive: "#cc5400",
  accentDisabled: "#ffd1b3",
  accentSubtle: "#fff4ec",
  accentForeground: "#ffffff",
  accentBorder: "#ffa366",

  /* ── Success ─────────────────────────────────────────────── */
  success: "#16a34a",
  successHover: "#15803d",
  successActive: "#166534",
  successDisabled: "#bbf7d0",
  successSubtle: "#f0fdf4",
  successForeground: "#ffffff",
  successBorder: "#86efac",

  /* ── Warning ─────────────────────────────────────────────── */
  warning: "#d97706",
  warningHover: "#b45309",
  warningActive: "#92400e",
  warningDisabled: "#fde68a",
  warningSubtle: "#fffbeb",
  warningForeground: "#ffffff",
  warningBorder: "#fcd34d",

  /* ── Error ───────────────────────────────────────────────── */
  error: "#dc2626",
  errorHover: "#b91c1c",
  errorActive: "#991b1b",
  errorDisabled: "#fecaca",
  errorSubtle: "#fef2f2",
  errorForeground: "#ffffff",
  errorBorder: "#fca5a5",

  /* ── Info — Accent Blue #1A56DB ──────────────────────────── */
  info: "#1A56DB",
  infoHover: "#174dc5",
  infoActive: "#1344af",
  infoDisabled: "#bbcff7",
  infoSubtle: "#eef3fd",
  infoForeground: "#ffffff",
  infoBorder: "#779fef",
} as const;

export type LightTheme = typeof lightTheme;
