/**
 * Nova Elevation / Shadow Scale
 * Navy-tinted light shadows. Dark-mode uses neutral tints.
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
  none:  "none",
  xs:    "0 1px 2px rgba(0, 42, 99, 0.06)",
  sm:    "0 1px 3px rgba(0, 42, 99, 0.08), 0 1px 2px rgba(0, 42, 99, 0.05)",
  md:    "0 4px 8px rgba(0, 42, 99, 0.08), 0 2px 4px rgba(0, 42, 99, 0.05)",
  lg:    "0 8px 24px rgba(0, 42, 99, 0.10), 0 4px 8px rgba(0, 42, 99, 0.06)",
  xl:    "0 16px 40px rgba(0, 42, 99, 0.12), 0 8px 16px rgba(0, 42, 99, 0.06)",
  "2xl": "0 24px 64px rgba(0, 42, 99, 0.18)",
  inner: "inset 0 2px 4px rgba(0, 42, 99, 0.06)",
} as const;

/** Dark-mode shadow variants — neutral-tinted for dark surfaces. */
export const shadowsDark = {
  none:  "none",
  xs:    "0 1px 2px rgba(0, 0, 0, 0.20)",
  sm:    "0 1px 3px rgba(0, 0, 0, 0.28), 0 1px 2px rgba(0, 0, 0, 0.20)",
  md:    "0 4px 8px rgba(0, 0, 0, 0.32), 0 2px 4px rgba(0, 0, 0, 0.20)",
  lg:    "0 8px 24px rgba(0, 0, 0, 0.36), 0 4px 8px rgba(0, 0, 0, 0.24)",
  xl:    "0 16px 40px rgba(0, 0, 0, 0.40), 0 8px 16px rgba(0, 0, 0, 0.28)",
  "2xl": "0 24px 64px rgba(0, 0, 0, 0.48)",
  inner: "inset 0 2px 4px rgba(0, 0, 0, 0.24)",
} as const;

export type ShadowScale = typeof shadows;
export type ShadowKey   = keyof ShadowScale;
