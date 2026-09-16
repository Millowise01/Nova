import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EcoBannerSection } from "./eco-banner-section";

describe("EcoBannerSection", () => {
  it("no longer shows a fabricated carbon-savings figure", () => {
    render(<EcoBannerSection />);

    expect(screen.queryByText(/1,842/)).not.toBeInTheDocument();
    expect(screen.queryByText(/kg saved/i)).not.toBeInTheDocument();
    expect(screen.getByText(/coming to your account soon/i)).toBeInTheDocument();
  });
});
