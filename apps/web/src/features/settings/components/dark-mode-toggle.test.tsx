import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const themeState = vi.hoisted(() => ({
  theme: "light",
  setTheme: vi.fn(),
}));
vi.mock("@/providers/theme-provider", () => ({
  useTheme: () => themeState,
}));

import { DarkModeToggle } from "./dark-mode-toggle";

beforeEach(() => {
  themeState.theme = "light";
  themeState.setTheme.mockReset();
});

describe("DarkModeToggle", () => {
  it("reflects the current theme: unchecked when light, checked when dark", () => {
    const { rerender } = render(<DarkModeToggle />);
    expect(screen.getByRole("switch", { name: /dark mode/i })).not.toBeChecked();

    themeState.theme = "dark";
    rerender(<DarkModeToggle />);
    expect(screen.getByRole("switch", { name: /dark mode/i })).toBeChecked();
  });

  it("calls the real ThemeProvider's setTheme when toggled on, and back off again", async () => {
    const { rerender } = render(<DarkModeToggle />);

    await userEvent.click(screen.getByRole("switch", { name: /dark mode/i }));
    expect(themeState.setTheme).toHaveBeenCalledWith("dark");

    themeState.theme = "dark";
    rerender(<DarkModeToggle />);
    await userEvent.click(screen.getByRole("switch", { name: /dark mode/i }));
    expect(themeState.setTheme).toHaveBeenCalledWith("light");
  });
});
