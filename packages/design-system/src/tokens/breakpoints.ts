/**
 * Nova Responsive System — mobile-first.
 * Breakpoint values are min-width thresholds.
 */
export const breakpoints = {
  sm:   "40rem",   //  640px
  md:   "48rem",   //  768px
  lg:   "64rem",   // 1024px
  xl:   "80rem",   // 1280px
  "2xl": "96rem",  // 1536px
} as const;

/** Max-width container per breakpoint. */
export const containerWidths = {
  sm:    "640px",
  md:    "768px",
  lg:    "1024px",
  xl:    "1280px",
  "2xl": "1536px",
  /** Capped content width — used for prose, forms, narrow layouts. */
  prose: "65ch",
} as const;

/** Responsive horizontal padding applied to containers. */
export const containerPadding = {
  base: "1rem",    // 16px — mobile
  sm:   "1.5rem",  // 24px — ≥640px
  lg:   "2rem",    // 32px — ≥1024px
  xl:   "2.5rem",  // 40px — ≥1280px
} as const;

/** 12-column grid config. */
export const grid = {
  columns: 12,
  gapSm:   "1rem",    // 16px
  gapMd:   "1.5rem",  // 24px
  gapLg:   "2rem",    // 32px
} as const;

/** Responsive spacing scale — section vertical rhythm. */
export const sectionSpacing = {
  sm:  "3rem",   //  48px
  md:  "5rem",   //  80px
  lg:  "6rem",   //  96px
  xl:  "8rem",   // 128px
} as const;

export type BreakpointScale = typeof breakpoints;
export type BreakpointKey   = keyof BreakpointScale;
