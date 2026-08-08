import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PieChart } from "./PieChart";

const data = [
  { name: "A", value: 10 },
  { name: "B", value: 20 },
];

describe("PieChart", () => {
  it("renders an SVG chart labeled for assistive tech", () => {
    const { container } = render(<PieChart data={data} />);
    expect(container.querySelector('[role="img"][aria-label="Pie chart"]')).toBeInTheDocument();
  });

  it("renders a loading skeleton instead of the chart when loading", () => {
    const { container } = render(<PieChart data={data} loading />);
    expect(container.querySelector('[role="img"]')).not.toBeInTheDocument();
  });
});
