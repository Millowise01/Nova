export type ChartSeriesColor = "primary" | "accent" | "success" | "warning" | "error" | "info";

export interface ChartSeries {
  key: string;
  label?: string;
  color?: ChartSeriesColor;
}

export const seriesColorVar: Record<ChartSeriesColor, string> = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
  info: "var(--color-info)",
};

/** Fallback rotation applied to series that don't specify a color. */
export const defaultSeriesColorOrder: ChartSeriesColor[] = [
  "primary",
  "accent",
  "success",
  "info",
  "warning",
  "error",
];

export function resolveSeriesColor(color: ChartSeriesColor | undefined, index: number): string {
  return seriesColorVar[color ?? defaultSeriesColorOrder[index % defaultSeriesColorOrder.length]];
}

/** Shared axis/grid/tooltip styling so every chart wrapper reads tokens the same way. */
export const chartAxisProps = {
  stroke: "var(--color-foreground-subtle)",
  tick: { fill: "var(--color-foreground-subtle)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

export const chartTooltipStyle = {
  background: "var(--color-surface-raised)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-foreground)",
} as const;

export const chartLegendStyle = {
  fontSize: 12,
  color: "var(--color-foreground-muted)",
} as const;
