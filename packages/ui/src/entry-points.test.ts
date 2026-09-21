import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import * as charts from "./charts";

import * as root from "./index";

/**
 * The package boundary is deliberate: `@nova/ui` is the application-facing component API, and
 * the chart components sit behind their own entry point (`@nova/ui/charts`) because they pull
 * in `recharts`, which is large. Anything exported from the root entry is available to every
 * app, and a bundler cannot always prove an unused re-export is safe to drop, so the root
 * entry must not re-export them. Measured before this change: apps/web loaded a 427 kB
 * `recharts` chunk on 44 of 53 routes although no app renders a chart.
 */
describe("@nova/ui entry points", () => {
  it("the root entry does not export any chart component", () => {
    for (const name of ["BarChart", "LineChart", "PieChart"]) {
      expect(root).not.toHaveProperty(name);
    }
  });

  it("the charts entry exports them", () => {
    for (const name of ["BarChart", "LineChart", "PieChart"]) {
      expect(charts).toHaveProperty(name);
    }
  });

  it("the root entry still exports the dashboard components that do not need recharts", () => {
    for (const name of ["DataTable", "StatCard", "MetricBadge"]) {
      expect(root).toHaveProperty(name);
    }
  });

  it("re-exports every @nova/design-system component, so applications need only @nova/ui", () => {
    for (const name of ["Button", "Card", "Input", "Dialog", "Tabs", "Sidebar", "Toast"]) {
      expect(root).toHaveProperty(name);
    }
  });

  it("declares both entry points, and no side effects, in package.json", () => {
    const manifest = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8")) as {
      exports: Record<string, string>;
      sideEffects: boolean;
    };
    expect(manifest.exports["."]).toBe("./src/index.ts");
    expect(manifest.exports["./charts"]).toBe("./src/charts.ts");
    expect(manifest.sideEffects).toBe(false);
  });
});
