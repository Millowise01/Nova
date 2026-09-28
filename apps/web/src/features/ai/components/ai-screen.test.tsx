import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// AiChat is real now (Tier 2, ADR-0005) and has its own dedicated test file —
// stubbed here so this test can stay scoped to what it's actually checking: that the
// still-unbuilt AI sections read as "coming soon" without implying the whole page is
// unfinished.
vi.mock("./ai-chat", () => ({
  AiChat: () => <div data-testid="ai-chat-stub" />,
}));

import { AIScreen } from "./ai-screen";

describe("AIScreen", () => {
  it("marks only the unbuilt sections as coming soon, not the real chat assistant", () => {
    render(<AIScreen />);
    expect(screen.getByTestId("ai-chat-stub")).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText("More AI features")).toBeInTheDocument();
    // No longer listed as a stub — it's a real chat interface now.
    expect(
      screen.queryByText("Conversational storefront assistant shell."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Side-by-side product intelligence interface."),
    ).not.toBeInTheDocument();
  });
});
