import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BottomNav, BottomNavItem } from "./bottom-nav";

describe("BottomNav", () => {
  it("renders a labeled navigation landmark with items", () => {
    render(
      <BottomNav label="Primary">
        <BottomNavItem href="/home" icon={<span />} active>
          Home
        </BottomNavItem>
        <BottomNavItem href="/search" icon={<span />}>
          Search
        </BottomNavItem>
      </BottomNav>,
    );

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /search/i })).not.toHaveAttribute("aria-current");
  });
});
