import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Regression test alongside orders/[id]/page.test.tsx: this page also never
// extracted its route param before the integration work. Mocking
// ProductScreen to render the prop it received proves the [slug] segment
// actually reaches it.
vi.mock("@/features/product/components/product-screen", () => ({
  ProductScreen: ({ slug }: { slug: string }) => <div data-testid="product-screen">{slug}</div>,
}));

import ProductDetailsPage from "./page";

describe("ProductDetailsPage", () => {
  it("extracts the [slug] route param and passes it to ProductScreen", async () => {
    const element = await ProductDetailsPage({ params: Promise.resolve({ slug: "blue-widget" }) });
    render(element);

    expect(screen.getByTestId("product-screen")).toHaveTextContent("blue-widget");
  });
});
