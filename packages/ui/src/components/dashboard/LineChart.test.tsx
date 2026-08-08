import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LineChart } from "./LineChart";

const data = [
  { month: "Jan", revenue: 100 },
  { month: "Feb", revenue: 200 },
];

describe("LineChart", () => {
  it("renders an SVG chart labeled for assistive tech", () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={[{ key: "revenue" }]} />,
    );
    expect(container.querySelector('[role="img"][aria-label="Line chart"]')).toBeInTheDocument();
  });

  it("renders a loading skeleton instead of the chart when loading", () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={[{ key: "revenue" }]} loading />,
    );
    expect(container.querySelector('[role="img"]')).not.toBeInTheDocument();
  });
});
