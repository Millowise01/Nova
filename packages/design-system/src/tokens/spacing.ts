/**
 * Nova Spacing — 8px base grid.
 * Numeric keys = pixel value. Use named aliases in components.
 */
export const spacing = {
  0: "0rem", //   0px
  1: "0.25rem", //   4px  — hairline / icon gap
  2: "0.5rem", //   8px  — xs
  3: "0.75rem", //  12px  — sm
  4: "1rem", //  16px  — md (base unit)
  6: "1.5rem", //  24px  — lg
  8: "2rem", //  32px  — xl
  10: "2.5rem", //  40px  — 2xl
  12: "3rem", //  48px  — 3xl
  16: "4rem", //  64px  — 4xl
  20: "5rem", //  80px  — 5xl
  24: "6rem", //  96px  — 6xl
  // Extended
  px: "1px",
  0.5: "0.125rem", //   2px
  1.5: "0.375rem", //   6px
  2.5: "0.625rem", //  10px
  3.5: "0.875rem", //  14px
  5: "1.25rem", //  20px
  7: "1.75rem", //  28px
  9: "2.25rem", //  36px
  11: "2.75rem", //  44px
  14: "3.5rem", //  56px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  48: "12rem", // 192px
  56: "14rem", // 224px
  64: "16rem", // 256px
} as const;

/** Semantic spacing aliases — use these in component code. */
export const space = {
  none: spacing[0],
  xs: spacing[2], //  8px
  sm: spacing[3], // 12px
  md: spacing[4], // 16px
  lg: spacing[6], // 24px
  xl: spacing[8], // 32px
  "2xl": spacing[10], // 40px
  "3xl": spacing[12], // 48px
  "4xl": spacing[16], // 64px
  "5xl": spacing[20], // 80px
  "6xl": spacing[24], // 96px
} as const;

export type SpacingScale = typeof spacing;
export type SpacingKey = keyof SpacingScale;
export type SpaceAlias = keyof typeof space;
