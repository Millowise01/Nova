import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsScreen } from "./analytics-screen";

describe("AnalyticsScreen", () => {
  it("marks itself as coming soon rather than implying real analytics data", () => {
    render(<AnalyticsScreen />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText(/nothing here is built yet/i)).toBeInTheDocument();
  });
});
