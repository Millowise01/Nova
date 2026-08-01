/**
 * Nova Enterprise Typography System
 *
 * Primary font: Inter
 * Fallback:     system-ui, sans-serif
 *
 * Scale roles (11 total):
 *   display      — hero sections, marketing banners
 *   h1           — page titles
 *   h2           — section headings
 *   h3           — sub-section headings
 *   h4           — card / panel headings
 *   bodyLarge    — lead paragraphs, feature descriptions
 *   body         — default body copy
 *   bodySmall    — secondary body, helper text
 *   caption      — image captions, timestamps, metadata
 *   label        — form labels, table headers, tags
 *   overline     — category labels, eyebrow text above headings
 */
export const typography = {
  fontFamily: {
    sans:    ["Inter", "system-ui", "sans-serif"],
    display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
    mono:    ["IBM Plex Mono", "ui-monospace", "monospace"],
  },

  scale: {
    /** 60px / 900 — hero banners, marketing splash */
    display: {
      fontSize:      "3.75rem",
      lineHeight:    "1",
      fontWeight:    900,
      letterSpacing: "-0.04em",
      fontFamily:    "display",
    },
    /** 48px / 800 — page-level H1 */
    h1: {
      fontSize:      "3rem",
      lineHeight:    "1.05",
      fontWeight:    800,
      letterSpacing: "-0.03em",
      fontFamily:    "sans",
    },
    /** 36px / 700 — section H2 */
    h2: {
      fontSize:      "2.25rem",
      lineHeight:    "1.1",
      fontWeight:    700,
      letterSpacing: "-0.02em",
      fontFamily:    "sans",
    },
    /** 28px / 700 — sub-section H3 */
    h3: {
      fontSize:      "1.75rem",
      lineHeight:    "1.2",
      fontWeight:    700,
      letterSpacing: "-0.01em",
      fontFamily:    "sans",
    },
    /** 22px / 600 — card / panel H4 */
    h4: {
      fontSize:      "1.375rem",
      lineHeight:    "1.3",
      fontWeight:    600,
      letterSpacing: "0em",
      fontFamily:    "sans",
    },
    /** 18px / 400 — lead paragraphs */
    bodyLarge: {
      fontSize:      "1.125rem",
      lineHeight:    "1.7",
      fontWeight:    400,
      letterSpacing: "0em",
      fontFamily:    "sans",
    },
    /** 16px / 400 — default body copy */
    body: {
      fontSize:      "1rem",
      lineHeight:    "1.6",
      fontWeight:    400,
      letterSpacing: "0em",
      fontFamily:    "sans",
    },
    /** 14px / 400 — secondary body, helper text */
    bodySmall: {
      fontSize:      "0.875rem",
      lineHeight:    "1.55",
      fontWeight:    400,
      letterSpacing: "0em",
      fontFamily:    "sans",
    },
    /** 12px / 400 — captions, timestamps, metadata */
    caption: {
      fontSize:      "0.75rem",
      lineHeight:    "1.4",
      fontWeight:    400,
      letterSpacing: "0.01em",
      fontFamily:    "sans",
    },
    /** 14px / 600 — form labels, table headers */
    label: {
      fontSize:      "0.875rem",
      lineHeight:    "1.35",
      fontWeight:    600,
      letterSpacing: "0em",
      fontFamily:    "sans",
    },
    /** 11px / 700 uppercase — category eyebrow text */
    overline: {
      fontSize:      "0.6875rem",
      lineHeight:    "1.4",
      fontWeight:    700,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      fontFamily:    "sans",
    },
  },

  /** Font-size raw scale (used by Tailwind config) */
  sizes: {
    xs:   "0.75rem",    // 12px
    sm:   "0.875rem",   // 14px
    base: "1rem",       // 16px
    lg:   "1.125rem",   // 18px
    xl:   "1.375rem",   // 22px
    "2xl": "1.75rem",   // 28px
    "3xl": "2.25rem",   // 36px
    "4xl": "3rem",      // 48px
    "5xl": "3.75rem",   // 60px
  },

  /** Font-weight scale */
  weights: {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
    black:     900,
  },

  /** Line-height scale */
  leading: {
    none:    "1",
    tight:   "1.1",
    snug:    "1.2",
    normal:  "1.5",
    relaxed: "1.6",
    loose:   "1.7",
  },

  /** Letter-spacing scale */
  tracking: {
    tighter: "-0.04em",
    tight:   "-0.02em",
    normal:  "0em",
    wide:    "0.04em",
    wider:   "0.08em",
    widest:  "0.1em",
  },
} as const;

export type TypographyScale = typeof typography.scale;
export type TypographyRole  = keyof TypographyScale;
