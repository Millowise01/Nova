import { tokens } from "./tokens";

export const spacing = tokens.spacing;

export const layout = {
  container: {
    sm: "100%",
    md: "42rem",
    lg: "64rem",
    xl: "80rem",
    "2xl": "96rem"
  },
  grid: {
    columns: 12,
    gap: spacing[4]
  }
} as const;