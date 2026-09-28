import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SupportScreen } from "./support-screen";

describe("SupportScreen", () => {
  it("marks the rest of the page as coming soon rather than reading like a finished feature", () => {
    render(<SupportScreen />);
    expect(screen.getByText(/most of this is coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/still being planned/i)).toBeInTheDocument();
    // No longer listed as a stub — it's a real link now (W-12).
    expect(screen.queryByText("Escalation and dispute resolution center.")).not.toBeInTheDocument();
  });

  it("links the real Dispute Center card to /support/disputes", () => {
    render(<SupportScreen />);
    const link = screen.getByRole("link", { name: /dispute center/i });
    expect(link).toHaveAttribute("href", "/support/disputes");
    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});
