/**
 * Nova Dark Theme
 * Dark backgrounds, elevated surfaces, full text hierarchy.
 * Nova Orange stays vibrant. Navy lightens for contrast on dark.
 */
export const darkTheme = {
  /* ── Backgrounds & Surfaces ──────────────────────────────── */
  background: "#030712",
  surface: "#111827",
  surfaceRaised: "#1f2937",
  surfaceOverlay: "rgba(3, 7, 18, 0.92)",
  surfaceNav: "#111827",
  surfaceFooter: "#030712",

  /* ── Foreground / Text ───────────────────────────────────── */
  foreground: "#f9fafb",
  foregroundMuted: "#d1d5db",
  foregroundSubtle: "#6b7280",
  foregroundOnPrimary: "#ffffff",
  foregroundOnAccent: "#ffffff",
  foregroundOnDark: "#f9fafb",

  /* ── Borders ─────────────────────────────────────────────── */
  border: "#374151",
  borderStrong: "#4b5563",
  borderInput: "#4b5563",
  borderFocus: "#779fef",

  /* ── Muted / Disabled ────────────────────────────────────── */
  muted: "#1f2937",
  mutedForeground: "#9ca3af",
  disabled: "#374151",
  disabledForeground: "#6b7280",

  /* ── Primary — lightened Navy for dark bg ────────────────── */
  primary: "#6690cf",
  primaryHover: "#99b5df",
  primaryActive: "#ccdaef",
  primaryDisabled: "#001a44",
  primarySubtle: "#001133",
  primaryForeground: "#ffffff",
  primaryBorder: "#336bbf",

  /* ── Secondary ───────────────────────────────────────────── */
  secondary: "#1f2937",
  secondaryHover: "#374151",
  secondaryActive: "#4b5563",
  secondaryDisabled: "#111827",
  secondaryForeground: "#ccdaef",
  secondaryBorder: "#374151",

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

  /* ── Info ────────────────────────────────────────────────── */
  info: "#779fef",
  infoHover: "#99b7f3",
  infoActive: "#bbcff7",
  infoDisabled: "#081e4d",
  infoSubtle: "#0c1a3d",
  infoForeground: "#030712",
  infoBorder: "#1A56DB",
} as const;

export type DarkTheme = typeof darkTheme;
