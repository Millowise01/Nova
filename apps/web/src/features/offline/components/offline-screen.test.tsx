import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OfflineScreen } from "./offline-screen";

describe("OfflineScreen", () => {
  it("marks itself as coming soon rather than reading like a finished feature", () => {
    render(<OfflineScreen />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText(/none of this is built yet/i)).toBeInTheDocument();
  });
});
