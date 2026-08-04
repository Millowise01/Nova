/**
 * Nova Dark Theme
 * Dark backgrounds, elevated surfaces, full text hierarchy.
 * Nova Orange stays vibrant. Navy lightens for contrast on dark.
 */
export const darkTheme = {
  /* ── Backgrounds & Surfaces ──────────────────────────────── */
  background: "#030712",
  surface: "#111827",
  surfaceRaised: "#1E293B",
  surfaceOverlay: "rgba(3, 7, 18, 0.92)",
  surfaceNav: "#111827",
  surfaceFooter: "#030712",

  /* ── Foreground / Text ───────────────────────────────────── */
  foreground: "#F8FAFC",
  foregroundMuted: "#E2E6E1",
  foregroundSubtle: "#64748B",
  foregroundOnPrimary: "#ffffff",
  foregroundOnAccent: "#ffffff",
  foregroundOnDark: "#F8FAFC",

  /* ── Borders ─────────────────────────────────────────────── */
  border: "#334155",
  borderStrong: "#475569",
  borderInput: "#475569",
  borderFocus: "#779fef",

  /* ── Muted / Disabled ────────────────────────────────────── */
  muted: "#1E293B",
  mutedForeground: "#94A3B8",
  disabled: "#334155",
  disabledForeground: "#64748B",

  /* ── Primary — lightened Navy for dark bg ────────────────── */
  primary: "#6690cf",
  primaryHover: "#99b5df",
  primaryActive: "#ccdaef",
  primaryDisabled: "#001a44",
  primarySubtle: "#001133",
  primaryForeground: "#ffffff",
  primaryBorder: "#336bbf",

  /* ── Secondary ───────────────────────────────────────────── */
  secondary: "#1E293B",
  secondaryHover: "#334155",
  secondaryActive: "#475569",
  secondaryDisabled: "#111827",
  secondaryForeground: "#ccdaef",
  secondaryBorder: "#334155",

  /* ── Accent — Nova Orange stays vibrant on dark ──────────── */
  accent: "#FF6A00",
  accentHover: "#ffa366",
  accentActive: "#ffba8d",
  accentDisabled: "#4d1f00",
  accentSubtle: "#1a0d00",
  accentForeground: "#ffffff",
  accentBorder: "#e65f00",

  /* ── Success ─────────────────────────────────────────────── */
  success: "#4ade80",
  successHover: "#86efac",
  successActive: "#bbf7d0",
  successDisabled: "#14532d",
  successSubtle: "#052e16",
  successForeground: "#030712",
  successBorder: "#22c55e",

  /* ── Warning ─────────────────────────────────────────────── */
  warning: "#fbbf24",
  warningHover: "#fcd34d",
  warningActive: "#fde68a",
  warningDisabled: "#78350f",
  warningSubtle: "#1c1400",
  warningForeground: "#030712",
  warningBorder: "#f59e0b",

  /* ── Error ───────────────────────────────────────────────── */
  error: "#f87171",
  errorHover: "#fca5a5",
  errorActive: "#fecaca",
  errorDisabled: "#7f1d1d",
  errorSubtle: "#2d0a0a",
  errorForeground: "#030712",
  errorBorder: "#ef4444",

  /**
   * Info — Tailwind blue-400/300/200/900, mirroring how this theme already
   * lightens other semantic colors for contrast against dark backgrounds
   * (see warning/error above). Light theme's info uses blue-600 (#2563EB);
   * infoBorder reuses that light-theme base value, matching the pattern
   * used by warningBorder/errorBorder in this same file.
   */
  info: "#60A5FA",
  infoHover: "#93C5FD",
  infoActive: "#BFDBFE",
  infoDisabled: "#1E3A8A",
  infoSubtle: "#0c1a3d",
  infoForeground: "#030712",
  infoBorder: "#2563EB",
} as const;

export type DarkTheme = typeof darkTheme;
