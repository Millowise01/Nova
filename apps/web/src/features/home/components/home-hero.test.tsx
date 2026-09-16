import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeHero } from "./home-hero";

describe("HomeHero", () => {
  it("no longer shows fabricated stats (35% off, CO2 saved) for capabilities that don't exist", () => {
    render(<HomeHero />);
    expect(screen.queryByText(/35% off/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CO2 Saved/i)).not.toBeInTheDocument();
  });

  it("marks Eco Impact and AI Assistant as coming soon, since neither has a backend", () => {
    render(<HomeHero />);
    expect(screen.getAllByText("Coming soon")).toHaveLength(2);
  });
});
