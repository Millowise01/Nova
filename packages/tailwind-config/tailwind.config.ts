import type { Config } from "tailwindcss";

/**
 * Nova Tailwind theme extension.
 *
 * All semantic color aliases reference CSS vars — they automatically
 * adapt to light / dark / high-contrast / custom themes at runtime.
 * No hardcoded brand colors in component classes.
 *
 * Usage:
 *   bg-primary          text-foreground       border-border
 *   bg-accent           text-foreground-muted shadow-md
 *   rounded-md          rounded-full          duration-200
 */
export const novaTheme = {
  colors: {
    /* ── Raw brand palette (for Storybook / docs only) ──── */
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
    "accent-blue": {
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

    /* ── Semantic aliases — all reference CSS vars ──────── */
    background: "var(--color-background)",
    surface: "var(--color-surface)",
    "surface-raised": "var(--color-surface-raised)",
    "surface-overlay": "var(--color-surface-overlay)",
    "surface-nav": "var(--color-surface-nav)",
    "surface-footer": "var(--color-surface-footer)",

    foreground: "var(--color-foreground)",
    "foreground-muted": "var(--color-foreground-muted)",
    "foreground-subtle": "var(--color-foreground-subtle)",
    "foreground-on-primary": "var(--color-foreground-on-primary)",
    "foreground-on-accent": "var(--color-foreground-on-accent)",
    "foreground-on-dark": "var(--color-foreground-on-dark)",

    border: "var(--color-border)",
    "border-strong": "var(--color-border-strong)",
    "border-input": "var(--color-border-input)",
    "border-focus": "var(--color-border-focus)",

    muted: "var(--color-muted)",
    "muted-foreground": "var(--color-muted-foreground)",
    disabled: "var(--color-disabled)",
    "disabled-foreground": "var(--color-disabled-foreground)",

    primary: "var(--color-primary)",
    "primary-hover": "var(--color-primary-hover)",
    "primary-active": "var(--color-primary-active)",
    "primary-disabled": "var(--color-primary-disabled)",
    "primary-subtle": "var(--color-primary-subtle)",
    "primary-foreground": "var(--color-primary-foreground)",
    "primary-border": "var(--color-primary-border)",

    secondary: "var(--color-secondary)",
    "secondary-hover": "var(--color-secondary-hover)",
    "secondary-active": "var(--color-secondary-active)",
    "secondary-disabled": "var(--color-secondary-disabled)",
    "secondary-foreground": "var(--color-secondary-foreground)",
    "secondary-border": "var(--color-secondary-border)",

    accent: "var(--color-accent)",
    "accent-hover": "var(--color-accent-hover)",
    "accent-active": "var(--color-accent-active)",
    "accent-disabled": "var(--color-accent-disabled)",
    "accent-subtle": "var(--color-accent-subtle)",
    "accent-foreground": "var(--color-accent-foreground)",
    "accent-border": "var(--color-accent-border)",

    success: "var(--color-success)",
    "success-hover": "var(--color-success-hover)",
    "success-active": "var(--color-success-active)",
    "success-disabled": "var(--color-success-disabled)",
    "success-subtle": "var(--color-success-subtle)",
    "success-foreground": "var(--color-success-foreground)",
    "success-border": "var(--color-success-border)",

    warning: "var(--color-warning)",
    "warning-hover": "var(--color-warning-hover)",
    "warning-active": "var(--color-warning-active)",
    "warning-disabled": "var(--color-warning-disabled)",
    "warning-subtle": "var(--color-warning-subtle)",
    "warning-foreground": "var(--color-warning-foreground)",
    "warning-border": "var(--color-warning-border)",

    error: "var(--color-error)",
    "error-hover": "var(--color-error-hover)",
    "error-active": "var(--color-error-active)",
    "error-disabled": "var(--color-error-disabled)",
    "error-subtle": "var(--color-error-subtle)",
    "error-foreground": "var(--color-error-foreground)",
    "error-border": "var(--color-error-border)",

    info: "var(--color-info)",
    "info-hover": "var(--color-info-hover)",
    "info-active": "var(--color-info-active)",
    "info-disabled": "var(--color-info-disabled)",
    "info-subtle": "var(--color-info-subtle)",
    "info-foreground": "var(--color-info-foreground)",
    "info-border": "var(--color-info-border)",
  },

  fontFamily: {
    sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
    display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif"],
    mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
  },

  fontSize: {
    xs: ["0.75rem", { lineHeight: "1.4" }],
    sm: ["0.875rem", { lineHeight: "1.55" }],
    base: ["1rem", { lineHeight: "1.6" }],
    lg: ["1.125rem", { lineHeight: "1.7" }],
    xl: ["1.375rem", { lineHeight: "1.3" }],
    "2xl": ["1.75rem", { lineHeight: "1.2" }],
    "3xl": ["2.25rem", { lineHeight: "1.1" }],
    "4xl": ["3rem", { lineHeight: "1.05" }],
    "5xl": ["3.75rem", { lineHeight: "1" }],
  },

  /** 8px base grid — matches spacing token keys */
  spacing: {
    px: "1px",
    0: "0rem",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    48: "12rem",
    56: "14rem",
    64: "16rem",
  },

  borderRadius: {
    none: "var(--radius-none)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    "2xl": "var(--radius-2xl)",
    full: "var(--radius-full)",
  },

  boxShadow: {
    none: "var(--shadow-none)",
    xs: "var(--shadow-xs)",
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-xl)",
    "2xl": "var(--shadow-2xl)",
    inner: "var(--shadow-inner)",
  },

  transitionDuration: {
    75: "75ms",
    100: "100ms",
    200: "200ms",
    250: "250ms",
    300: "300ms",
    400: "400ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },

  transitionTimingFunction: {
    ease: "ease",
    "ease-in": "ease-in",
    "ease-out": "ease-out",
    "ease-in-out": "ease-in-out",
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },

  screens: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  maxWidth: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    prose: "65ch",
  },

  zIndex: {
    hide: "-1",
    base: "0",
    raised: "10",
    dropdown: "1000",
    sticky: "1100",
    overlay: "1200",
    modal: "1300",
    toast: "1400",
    tooltip: "1500",
  },

  animation: {
    "fade-in": "nova-fade-in var(--duration-200) var(--ease-standard) both",
    "slide-up": "nova-slide-up var(--duration-300) var(--ease-spring) both",
    "slide-down": "nova-slide-down var(--duration-300) var(--ease-spring) both",
    "slide-in-right": "nova-slide-in-right var(--duration-300) var(--ease-spring) both",
    "slide-in-left": "nova-slide-in-left var(--duration-300) var(--ease-spring) both",
    "scale-in": "nova-scale-in var(--duration-200) var(--ease-spring) both",
    spin: "nova-spin 700ms linear infinite",
    pulse: "nova-pulse 1500ms ease-in-out infinite",
    shimmer: "nova-shimmer 1500ms linear infinite",
  },
} satisfies Config["theme"];

const config: Config = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: novaTheme,
  },
  plugins: [],
};

export default config;
