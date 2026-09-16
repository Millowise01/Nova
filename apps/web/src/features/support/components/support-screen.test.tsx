import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SupportScreen } from "./support-screen";

describe("SupportScreen", () => {
  it("marks itself as coming soon rather than reading like a finished feature", () => {
    render(<SupportScreen />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText(/none of this is built yet/i)).toBeInTheDocument();
  });
});
