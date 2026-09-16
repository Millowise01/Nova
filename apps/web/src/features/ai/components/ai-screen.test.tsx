import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIScreen } from "./ai-screen";

describe("AIScreen", () => {
  it("marks itself as coming soon rather than reading like a finished feature", () => {
    render(<AIScreen />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText(/none of this is built yet/i)).toBeInTheDocument();
  });
});
