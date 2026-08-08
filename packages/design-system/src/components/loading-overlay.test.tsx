import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingOverlay } from "./loading-overlay";

describe("LoadingOverlay", () => {
  it("renders a busy status region with the given label", () => {
    render(<LoadingOverlay label="Placing your order..." />);
    const overlay = screen.getByText("Placing your order...", { selector: "p" }).parentElement;
    expect(overlay).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveAccessibleName("Placing your order...");
  });

  it("renders nothing when visible is false", () => {
    render(<LoadingOverlay visible={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
