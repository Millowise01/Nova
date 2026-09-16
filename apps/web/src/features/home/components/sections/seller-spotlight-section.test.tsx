import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createTestQueryClient, withQueryClient } from "@/test-utils/query-client";

import { SellerSpotlightSection } from "./seller-spotlight-section";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();
const SELLER_ID = "22222222-2222-2222-2222-222222222222";

function productFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    sellerId: SELLER_ID,
    categoryId: "33333333-3333-3333-3333-333333333333",
    brandId: null,
    title: "Test Product",
    slug: "test-product",
    description: null,
    status: "active",
    countryCode: "SL",
    isFeatured: false,
    isFlashSale: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    deletedAt: null,
    variants: [],
    ...overrides,
  };
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SellerSpotlightSection", () => {
  it("renders the real seller profile and product count from GET /sellers/:id, with no fabricated fulfillment/response-time stats", async () => {
    server.use(
      http.get(`${BASE_URL}/sellers/${SELLER_ID}`, () =>
        HttpResponse.json({
          data: {
            id: SELLER_ID,
            name: "Freetown Traders",
            memberSince: "2024-03-01T00:00:00.000Z",
          },
        }),
      ),
      http.get(`${BASE_URL}/sellers/${SELLER_ID}/products`, () =>
        HttpResponse.json({
          data: [productFixture(), productFixture({ id: "44444444-4444-4444-4444-444444444444" })],
          pageInfo: { hasMore: false, nextCursor: null },
        }),
      ),
    );

    const queryClient = createTestQueryClient();
    render(<SellerSpotlightSection sellerId={SELLER_ID} />, {
      wrapper: withQueryClient(queryClient),
    });

    await waitFor(() => expect(screen.getByText("Freetown Traders")).toBeInTheDocument());
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText(/fulfillment/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/response time/i)).not.toBeInTheDocument();
    expect(screen.queryByText("98.2%")).not.toBeInTheDocument();
    expect(screen.queryByText("Freetown Tech Hub")).not.toBeInTheDocument();
  });

  it("shows a '+' after the count when the seller has more products than the first page returned", async () => {
    server.use(
      http.get(`${BASE_URL}/sellers/${SELLER_ID}`, () =>
        HttpResponse.json({
          data: {
            id: SELLER_ID,
            name: "Freetown Traders",
            memberSince: "2024-03-01T00:00:00.000Z",
          },
        }),
      ),
      http.get(`${BASE_URL}/sellers/${SELLER_ID}/products`, () =>
        HttpResponse.json({
          data: [productFixture()],
          pageInfo: { hasMore: true, nextCursor: "next" },
        }),
      ),
    );

    const queryClient = createTestQueryClient();
    render(<SellerSpotlightSection sellerId={SELLER_ID} />, {
      wrapper: withQueryClient(queryClient),
    });

    await waitFor(() => expect(screen.getByText("1+")).toBeInTheDocument());
  });

  it("renders nothing and fires no request when no sellerId is available yet", () => {
    let requested = false;
    server.use(
      http.get(`${BASE_URL}/sellers/*`, () => {
        requested = true;
        return HttpResponse.json({}, { status: 404 });
      }),
    );

    const queryClient = createTestQueryClient();
    const { container } = render(<SellerSpotlightSection />, {
      wrapper: withQueryClient(queryClient),
    });

    expect(container).toBeEmptyDOMElement();
    expect(requested).toBe(false);
  });
});
