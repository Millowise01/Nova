import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsScreen } from "./settings-screen";

// ProfileCard is real (fetches from GET/PATCH /v1/me) and already covered by
// its own tests — stubbed here so this test can stay scoped to what it's
// actually checking: that the still-unbuilt settings sections read as
// "coming soon" without implying the whole page is unfinished.
vi.mock("@/features/account/components/profile-card", () => ({
  ProfileCard: () => <div data-testid="profile-card-stub" />,
}));

describe("SettingsScreen", () => {
  it("marks only the unbuilt sections as coming soon, not the real Profile section", () => {
    render(<SettingsScreen />);
    expect(screen.getByTestId("profile-card-stub")).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText("More settings")).toBeInTheDocument();
  });
});
