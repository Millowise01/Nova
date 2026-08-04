/**
 * Nova Enterprise Typography System
 *
 * Primary font: Inter
 * Fallback:     system-ui, sans-serif
 *
 * Scale roles match the Phase 2 Enterprise Design System spec exactly
 * (Section 2, Type Scale — Desktop). Sizes/line-heights below are the
 * printed px values converted to rem; nothing here was carried over from
 * the prior scale, which used different role names and step sizes.
 *
 *   display1     — 60px/72px — hero banners, marketing splash
 *   display2     — 48px/56px — secondary hero / large section intro
 *   heading1     — 36px/44px — page titles
 *   heading2     — 30px/36px — section headings
 *   heading3     — 24px/32px — sub-section headings
 *   heading4     — 20px/28px — card / panel headings
 *   bodyLarge    — 18px/28px — lead paragraphs, feature descriptions
 *   bodyBase     — 16px/24px — default body copy
 *   bodySmall    — 14px/20px — secondary body, helper text
 *   caption      — 12px/16px — image captions, timestamps, metadata
 *
 * label/overline are retained beyond the source spec — form labels, table
 * headers, and eyebrow text need a role and the image doesn't define one.
 */
export const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
    mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
  },

  scale: {
    /** 60px / 72px — hero banners, marketing splash */
    display1: {
      fontSize: "3.75rem",
      lineHeight: "4.5rem",
      fontWeight: 800,
      letterSpacing: "-0.04em",
      fontFamily: "display",
    },
    /** 48px / 56px — secondary hero / large section intro */
    display2: {
      fontSize: "3rem",
      lineHeight: "3.5rem",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      fontFamily: "display",
    },
    /** 36px / 44px — page titles */
    heading1: {
      fontSize: "2.25rem",
      lineHeight: "2.75rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontFamily: "sans",
    },
    /** 30px / 36px — section headings */
    heading2: {
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontFamily: "sans",
    },
    /** 24px / 32px — sub-section headings */
    heading3: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      fontFamily: "sans",
    },
    /** 20px / 28px — card / panel headings */
    heading4: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
      letterSpacing: "0em",
      fontFamily: "sans",
    },
    /** 18px / 28px — lead paragraphs */
    bodyLarge: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 400,
      letterSpacing: "0em",
      fontFamily: "sans",
    },
    /** 16px / 24px — default body copy */
    bodyBase: {
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: 400,
      letterSpacing: "0em",
      fontFamily: "sans",
    },
    /** 14px / 20px — secondary body, helper text */
    bodySmall: {
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      fontWeight: 400,
      letterSpacing: "0em",
      fontFamily: "sans",
    },
    /** 12px / 16px — captions, timestamps, metadata */
    caption: {
      fontSize: "0.75rem",
      lineHeight: "1rem",
      fontWeight: 400,
      letterSpacing: "0.01em",
      fontFamily: "sans",
    },
    /** 14px / 600 — form labels, table headers (not in source spec) */
    label: {
      fontSize: "0.875rem",
      lineHeight: "1.35",
      fontWeight: 600,
      letterSpacing: "0em",
      fontFamily: "sans",
    },
    /** 11px / 700 uppercase — category eyebrow text (not in source spec) */
    overline: {
      fontSize: "0.6875rem",
      lineHeight: "1.4",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      fontFamily: "sans",
    },
  },

  /** Font-size raw scale (used by Tailwind config) */
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.375rem", // 22px
    "2xl": "1.75rem", // 28px
    "3xl": "2.25rem", // 36px
    "4xl": "3rem", // 48px
    "5xl": "3.75rem", // 60px
  },

  /** Font-weight scale */
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    /** Beyond the source spec (which stops at Extra Bold 800) — retained extension. */
    black: 900,
  },

  /** Line-height scale */
  leading: {
    none: "1",
    tight: "1.1",
    snug: "1.2",
    normal: "1.5",
    relaxed: "1.6",
    loose: "1.7",
  },

  /** Letter-spacing scale */
  tracking: {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0em",
    wide: "0.04em",
    wider: "0.08em",
    widest: "0.1em",
  },
} as const;

export type TypographyScale = typeof typography.scale;
export type TypographyRole = keyof TypographyScale;
