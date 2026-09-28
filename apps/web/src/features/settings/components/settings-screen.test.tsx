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

// DarkModeToggle is also real now (W-13) and has its own dedicated test file —
// mocked here for the same reason ProfileCard is.
vi.mock("@/providers/theme-provider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

describe("SettingsScreen", () => {
  it("marks only the unbuilt sections as coming soon, not the real Profile or Dark Mode sections", () => {
    render(<SettingsScreen />);
    expect(screen.getByTestId("profile-card-stub")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /dark mode/i })).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText("More settings")).toBeInTheDocument();
    // No longer listed as a stub — it's a real toggle now.
    expect(screen.queryByText("Theme mode preferences and persistence.")).not.toBeInTheDocument();
  });
});
