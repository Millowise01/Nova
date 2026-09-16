import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { addLine, ensureCartId } from "@/services/cart-checkout.service";
import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";
import type { Product } from "@/types/domain";

import { ProductSection } from "./product-section";

// Same mocking approach as cart.mutations.test.tsx — ProductSection's "Add"
// button now goes through the real useAddToCartMutation.
vi.mock("@/services/cart-checkout.service", () => ({
  ensureCartId: vi.fn(),
  addLine: vi.fn(),
}));

const CART_ID = "11111111-1111-1111-1111-111111111111";
const VARIANT_ID = "22222222-2222-2222-2222-222222222222";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "test-product",
    title: "Test Product",
    description: "",
    price: { amount: "9.99", currency: "SLE", formatted: "SLE 9.99" },
    rating: 0,
    reviewCount: 0,
    images: [],
    sellerId: "44444444-4444-4444-4444-444444444444",
    sellerName: "Nova Seller",
    variantId: VARIANT_ID,
    inStock: true,
    category: "cat",
    tags: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(ensureCartId).mockReset().mockResolvedValue(CART_ID);
  vi.mocked(addLine).mockReset().mockResolvedValue(undefined);
});

describe("ProductSection", () => {
  it("links each card's title to its real product detail page — previously not a link at all", () => {
    const queryClient = createTestQueryClient();
    render(<ProductSection description="d" products={[product()]} title="Best Sellers" />, {
      wrapper: withQueryClientAndToast(queryClient),
    });

    expect(screen.getByRole("link", { name: "Test Product" })).toHaveAttribute(
      "href",
      "/product/test-product",
    );
  });

  it("the Add button calls the real add-to-cart mutation — previously had no onClick at all", async () => {
    const queryClient = createTestQueryClient();
    render(<ProductSection description="d" products={[product()]} title="Best Sellers" />, {
      wrapper: withQueryClientAndToast(queryClient),
    });

    screen.getByRole("button", { name: "Add" }).click();

    await waitFor(() =>
      expect(addLine).toHaveBeenCalledWith(CART_ID, { variantId: VARIANT_ID, quantity: 1 }),
    );
  });

  it("disables Add when the product has no variant to buy", () => {
    const queryClient = createTestQueryClient();
    render(
      <ProductSection
        description="d"
        products={[product({ variantId: undefined, inStock: false })]}
        title="Best Sellers"
      />,
      { wrapper: withQueryClientAndToast(queryClient) },
    );

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });
});
