/**
 * Nova Z-Index Scale — named stacking layers.
 * Always use these instead of raw numbers.
 */
export const zIndex = {
  hide:     -1,
  base:      0,
  raised:   10,
  dropdown: 1000,
  sticky:   1100,
  overlay:  1200,
  modal:    1300,
  toast:    1400,
  tooltip:  1500,
} as const;

export type ZIndexScale = typeof zIndex;
export type ZIndexKey   = keyof ZIndexScale;
