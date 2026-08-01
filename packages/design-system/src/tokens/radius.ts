/**
 * Nova Border Radius Scale
 */
export const radius = {
  none:  "0px",
  sm:    "0.25rem",   //  4px — tags, badges
  md:    "0.5rem",    //  8px — inputs, buttons
  lg:    "0.75rem",   // 12px — cards
  xl:    "1rem",      // 16px — modals, panels
  "2xl": "1.5rem",    // 24px — large cards, sheets
  full:  "9999px",    // pill — avatars, chips, toggles
} as const;

export type RadiusScale = typeof radius;
export type RadiusKey   = keyof RadiusScale;
