import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Product } from "@/types/domain";

import { RecommendationsSection } from "./recommendations-section";

function productFixture(overrides: Partial<Product> = {}): Product {
  return {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as Product["id"],
    slug: "wireless-mouse",
    title: "Wireless Mouse",
    description: "",
    price: { amount: "25.00", currency: "SLE", formatted: "SLE 25.00" },
    rating: 0,
    reviewCount: 0,
    images: [],
    sellerId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as Product["sellerId"],
    sellerName: "Nova Seller",
    inStock: true,
    category: "cccccccc",
    tags: [],
    ...overrides,
  };
}

describe("RecommendationsSection", () => {
  it("renders the given products immediately, with copy that no longer claims AI or personalization", () => {
    render(<RecommendationsSection products={[productFixture()]} />);

    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
    expect(screen.getByText("SLE 25.00")).toBeInTheDocument();
    expect(screen.queryByText(/ai recommendation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/personalized/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/generating recommendations/i)).not.toBeInTheDocument();
  });
});
