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

  /* ── Success — lightened Nova Green for contrast on dark ──── */
  success: "#57e88d",
  successHover: "#81eea9",
  successActive: "#abf4c6",
  successDisabled: "#0b5326",
  successSubtle: "#073518",
  successForeground: "#030712",
  successBorder: "#16A34A",

  /* ── Warning ─────────────────────────────────────────────── */
  warning: "#fbbf24",
  warningHover: "#fcd34d",
  warningActive: "#fde68a",
  warningDisabled: "#78350f",
  warningSubtle: "#1c1400",
  warningForeground: "#030712",
  warningBorder: "#f59e0b",

  /* ── Error — lightened Nova Red for contrast on dark ──────── */
  error: "#ea8080",
  errorHover: "#f0a0a0",
  errorActive: "#f5c0c0",
  errorDisabled: "#711212",
  errorSubtle: "#480c0c",
  errorForeground: "#030712",
  errorBorder: "#DC2626",

  /**
   * Info — now backed by `colors.info` (#2563EB anchor) instead of stock
   * Tailwind blue, mirroring how this theme already lightens other semantic
   * colors for contrast against dark backgrounds (see success/error above).
   * infoBorder reuses the light-theme base value, matching the pattern used
   * by successBorder/errorBorder in this same file.
   */
  info: "#7fa3f3",
  infoHover: "#9fbaf6",
  infoActive: "#bfd1f9",
  infoDisabled: "#0c307f",
  infoSubtle: "#071e51",
  infoForeground: "#030712",
  infoBorder: "#2563EB",
} as const;

export type DarkTheme = typeof darkTheme;
