/**
 * Nova Elevation / Shadow Scale
 * Phase 2 Enterprise Design System spec, Section 7 — exact rgba values.
 * Note: this replaces the prior scale's deliberate navy-tint (rgba(0,42,99,*))
 * with the spec's plain black-tint (rgba(0,0,0,*)) — a visible aesthetic
 * change, not just an addition. Dark-mode (shadowsDark, below) was already
 * black-tinted and is unaffected.
 *
 * Use-case map:
 *   xs   — subtle lift: table rows, list items
 *   sm   — cards, inputs on focus
 *   md   — dropdowns, popovers
 *   lg   — modals, drawers
 *   xl   — floating action buttons, sticky headers
 *   2xl  — full-page overlays, command palette
 */
export const shadows = {
  none: "none",
  xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
  md: "0 4px 6px rgba(0, 0, 0, 0.10)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.12)",
  xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
  "2xl": "0 25px 50px rgba(0, 0, 0, 0.18)",
  inner: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
} as const;

/** Dark-mode shadow variants — neutral-tinted for dark surfaces. */
export const shadowsDark = {
  none: "none",
  xs: "0 1px 2px rgba(0, 0, 0, 0.20)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.28), 0 1px 2px rgba(0, 0, 0, 0.20)",
  md: "0 4px 8px rgba(0, 0, 0, 0.32), 0 2px 4px rgba(0, 0, 0, 0.20)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.36), 0 4px 8px rgba(0, 0, 0, 0.24)",
  xl: "0 16px 40px rgba(0, 0, 0, 0.40), 0 8px 16px rgba(0, 0, 0, 0.28)",
  "2xl": "0 24px 64px rgba(0, 0, 0, 0.48)",
  inner: "inset 0 2px 4px rgba(0, 0, 0, 0.24)",
} as const;

export type ShadowScale = typeof shadows;
export type ShadowKey = keyof ShadowScale;
