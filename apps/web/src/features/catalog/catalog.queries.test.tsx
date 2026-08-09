import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createTestQueryClient, withQueryClient } from "@/test-utils/query-client";

import { useProductQuery, useProductsQuery } from "./catalog.queries";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

function productFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    sellerId: "22222222-2222-2222-2222-222222222222",
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

describe("useProductsQuery (cursor pagination)", () => {
  it("fetches page 1, then fetchNextPage advances using pageInfo.nextCursor", async () => {
    server.use(
      http.get(`${BASE_URL}/products`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        if (!cursor) {
          return HttpResponse.json({
            data: [
              productFixture({
                id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                slug: "product-1",
              }),
            ],
            pageInfo: { hasMore: true, nextCursor: "page-2-cursor" },
          });
        }
        expect(cursor).toBe("page-2-cursor");
        return HttpResponse.json({
          data: [
            productFixture({
              id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
              slug: "product-2",
            }),
          ],
          pageInfo: { hasMore: false, nextCursor: null },
        });
      }),
    );

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useProductsQuery(), {
      wrapper: withQueryClient(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0]?.data[0]?.slug).toBe("product-1");
    expect(result.current.hasNextPage).toBe(true);

    await result.current.fetchNextPage();

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(result.current.data?.pages[1]?.data[0]?.slug).toBe("product-2");
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useProductQuery", () => {
  it("surfaces a 404 as an error query state, not a thrown/uncaught exception", async () => {
    server.use(
      http.get(`${BASE_URL}/products/missing`, () =>
        HttpResponse.json(
          { error: { code: "PRODUCT_NOT_FOUND", message: "Not found", correlationId: "c-1" } },
          { status: 404 },
        ),
      ),
    );

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useProductQuery("missing"), {
      wrapper: withQueryClient(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("does not fire a request when slug is empty (enabled: slug.length > 0)", async () => {
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/products/:slug`, () => {
        requestCount += 1;
        return HttpResponse.json({ data: productFixture() });
      }),
    );

    const queryClient = createTestQueryClient();
    renderHook(() => useProductQuery(""), { wrapper: withQueryClient(queryClient) });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(requestCount).toBe(0);
  });
});
