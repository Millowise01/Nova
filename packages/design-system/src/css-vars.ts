/**
 * Nova CSS Custom Property reference map.
 * Use in JS/TS contexts instead of raw strings.
 *
 * @example
 *   style={{ color: cssVars.color.foreground }}  // → "var(--color-foreground)"
 */
export const cssVars = {
  color: {
    background:       "var(--color-background)",
    surface:          "var(--color-surface)",
    surfaceRaised:    "var(--color-surface-raised)",
    surfaceOverlay:   "var(--color-surface-overlay)",
    surfaceNav:       "var(--color-surface-nav)",
    surfaceFooter:    "var(--color-surface-footer)",

    foreground:           "var(--color-foreground)",
    foregroundMuted:      "var(--color-foreground-muted)",
    foregroundSubtle:     "var(--color-foreground-subtle)",
    foregroundOnPrimary:  "var(--color-foreground-on-primary)",
    foregroundOnAccent:   "var(--color-foreground-on-accent)",
    foregroundOnDark:     "var(--color-foreground-on-dark)",

    border:       "var(--color-border)",
    borderStrong: "var(--color-border-strong)",
    borderInput:  "var(--color-border-input)",
    borderFocus:  "var(--color-border-focus)",

    muted:              "var(--color-muted)",
    mutedForeground:    "var(--color-muted-foreground)",
    disabled:           "var(--color-disabled)",
    disabledForeground: "var(--color-disabled-foreground)",

    primary:           "var(--color-primary)",
    primaryHover:      "var(--color-primary-hover)",
    primaryActive:     "var(--color-primary-active)",
    primaryDisabled:   "var(--color-primary-disabled)",
    primarySubtle:     "var(--color-primary-subtle)",
    primaryForeground: "var(--color-primary-foreground)",
    primaryBorder:     "var(--color-primary-border)",

    secondary:           "var(--color-secondary)",
    secondaryHover:      "var(--color-secondary-hover)",
    secondaryActive:     "var(--color-secondary-active)",
    secondaryDisabled:   "var(--color-secondary-disabled)",
    secondaryForeground: "var(--color-secondary-foreground)",
    secondaryBorder:     "var(--color-secondary-border)",

    accent:           "var(--color-accent)",
    accentHover:      "var(--color-accent-hover)",
    accentActive:     "var(--color-accent-active)",
    accentDisabled:   "var(--color-accent-disabled)",
    accentSubtle:     "var(--color-accent-subtle)",
    accentForeground: "var(--color-accent-foreground)",
    accentBorder:     "var(--color-accent-border)",

    success:           "var(--color-success)",
    successHover:      "var(--color-success-hover)",
    successActive:     "var(--color-success-active)",
    successDisabled:   "var(--color-success-disabled)",
    successSubtle:     "var(--color-success-subtle)",
    successForeground: "var(--color-success-foreground)",
    successBorder:     "var(--color-success-border)",

    warning:           "var(--color-warning)",
    warningHover:      "var(--color-warning-hover)",
    warningActive:     "var(--color-warning-active)",
    warningDisabled:   "var(--color-warning-disabled)",
    warningSubtle:     "var(--color-warning-subtle)",
    warningForeground: "var(--color-warning-foreground)",
    warningBorder:     "var(--color-warning-border)",

    error:           "var(--color-error)",
    errorHover:      "var(--color-error-hover)",
    errorActive:     "var(--color-error-active)",
    errorDisabled:   "var(--color-error-disabled)",
    errorSubtle:     "var(--color-error-subtle)",
    errorForeground: "var(--color-error-foreground)",
    errorBorder:     "var(--color-error-border)",

    info:           "var(--color-info)",
    infoHover:      "var(--color-info-hover)",
    infoActive:     "var(--color-info-active)",
    infoDisabled:   "var(--color-info-disabled)",
    infoSubtle:     "var(--color-info-subtle)",
    infoForeground: "var(--color-info-foreground)",
    infoBorder:     "var(--color-info-border)",

    focusRing: "var(--color-focus-ring)",
  },

  font: {
    sans:    "var(--font-sans)",
    display: "var(--font-display)",
    mono:    "var(--font-mono)",
  },

  /** 8px-base spacing — keys match spacing token keys */
  space: {
    0:  "var(--space-0)",
    1:  "var(--space-1)",
    2:  "var(--space-2)",
    3:  "var(--space-3)",
    4:  "var(--space-4)",
    6:  "var(--space-6)",
    8:  "var(--space-8)",
    10: "var(--space-10)",
    12: "var(--space-12)",
    16: "var(--space-16)",
    20: "var(--space-20)",
    24: "var(--space-24)",
  },

  radius: {
    none: "var(--radius-none)",
    sm:   "var(--radius-sm)",
    md:   "var(--radius-md)",
    lg:   "var(--radius-lg)",
    xl:   "var(--radius-xl)",
    "2xl":"var(--radius-2xl)",
    full: "var(--radius-full)",
  },

  shadow: {
    none:  "var(--shadow-none)",
    xs:    "var(--shadow-xs)",
    sm:    "var(--shadow-sm)",
    md:    "var(--shadow-md)",
    lg:    "var(--shadow-lg)",
    xl:    "var(--shadow-xl)",
    "2xl": "var(--shadow-2xl)",
    inner: "var(--shadow-inner)",
  },

  duration: {
    "75":   "var(--duration-75)",
    "100":  "var(--duration-100)",
    "200":  "var(--duration-200)",
    "300":  "var(--duration-300)",
    "500":  "var(--duration-500)",
    "700":  "var(--duration-700)",
    "1000": "var(--duration-1000)",
    // Semantic aliases
    instant: "var(--duration-75)",
    fast:    "var(--duration-100)",
    normal:  "var(--duration-200)",
    slow:    "var(--duration-300)",
    slower:  "var(--duration-500)",
    slowest: "var(--duration-700)",
  },

  ease: {
    ease:       "var(--ease-ease)",
    easeIn:     "var(--ease-in)",
    easeOut:    "var(--ease-out)",
    easeInOut:  "var(--ease-in-out)",
    spring:     "var(--ease-spring)",
    standard:   "var(--ease-standard)",
    emphasized: "var(--ease-emphasized)",
    exit:       "var(--ease-exit)",
  },

  z: {
    hide:     "var(--z-hide)",
    base:     "var(--z-base)",
    raised:   "var(--z-raised)",
    dropdown: "var(--z-dropdown)",
    sticky:   "var(--z-sticky)",
    overlay:  "var(--z-overlay)",
    modal:    "var(--z-modal)",
    toast:    "var(--z-toast)",
    tooltip:  "var(--z-tooltip)",
  },
} as const;

export type CssVars = typeof cssVars;
