"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Skeleton } from "@nova/design-system";
import { cn } from "@nova/utils";

import {
  chartLegendStyle,
  chartTooltipStyle,
  resolveSeriesColor,
  type ChartSeriesColor,
} from "./chart-theme";

export interface PieChartDatum {
  name: string;
  value: number;
  color?: ChartSeriesColor;
}

export interface PieChartProps {
  data: PieChartDatum[];
  height?: number;
  loading?: boolean;
  donut?: boolean;
  className?: string;
}

/** Themed Recharts pie/donut chart — reads Nova color tokens only, no hardcoded hex. */
export function PieChart({
  data,
  height = 300,
  loading = false,
  donut = false,
  className,
}: PieChartProps) {
  if (loading) {
    return <Skeleton className={cn("w-full rounded-lg", className)} style={{ height }} />;
  }

  return (
    <div className={cn("w-full", className)} style={{ height }} role="img" aria-label="Pie chart">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={donut ? "55%" : 0}
            outerRadius="80%"
            paddingAngle={data.length > 1 ? 2 : 0}
          >
            {data.map((d, i) => (
              <Cell
                key={d.name}
                fill={resolveSeriesColor(d.color, i)}
                stroke="var(--color-surface-raised)"
              />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend wrapperStyle={chartLegendStyle} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
