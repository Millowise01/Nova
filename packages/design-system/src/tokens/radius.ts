/**
 * Nova Border Radius Scale
 * Phase 2 Enterprise Design System spec, Section 6 — exact 9-step scale.
 */
export const radius = {
  none: "0px",
  xs: "0.125rem", //  2px
  sm: "0.25rem", //  4px — tags, badges
  md: "0.375rem", //  6px
  lg: "0.5rem", //  8px — inputs, buttons
  xl: "0.75rem", // 12px — cards
  "2xl": "1rem", // 16px — modals, panels
  "3xl": "1.5rem", // 24px — large cards, sheets
  full: "9999px", // pill — avatars, chips, toggles
} as const;

export type RadiusScale = typeof radius;
export type RadiusKey = keyof RadiusScale;
