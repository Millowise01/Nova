import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BarChart } from "./BarChart";

const data = [
  { day: "Mon", sales: 10 },
  { day: "Tue", sales: 20 },
];

describe("BarChart", () => {
  it("renders an SVG chart labeled for assistive tech", () => {
    const { container } = render(<BarChart data={data} xKey="day" series={[{ key: "sales" }]} />);
    expect(container.querySelector('[role="img"][aria-label="Bar chart"]')).toBeInTheDocument();
  });

  it("renders a loading skeleton instead of the chart when loading", () => {
    const { container } = render(
      <BarChart data={data} xKey="day" series={[{ key: "sales" }]} loading />,
    );
    expect(container.querySelector('[role="img"]')).not.toBeInTheDocument();
  });
});
