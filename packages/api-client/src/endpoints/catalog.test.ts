import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { ApiError } from "../errors";
import { createApiClient } from "../http-client";

import { createCatalogEndpoints } from "./catalog";

const BASE_URL = "https://api.test";
const server = setupServer();
const PRODUCT_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const CATEGORY_ID = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";

function productFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: PRODUCT_ID,
    sellerId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    categoryId: CATEGORY_ID,
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

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("listProducts (cursor pagination)", () => {
  it("parses the list envelope directly at the top level — NOT double-nested under .data.data like single-resource endpoints", async () => {
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({
          data: [productFixture()],
          pageInfo: { hasMore: true, nextCursor: "cursor-2" },
        }),
      ),
    );

    const endpoints = createCatalogEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.listProducts();

    expect(result.data).toHaveLength(1);
    expect(result.pageInfo).toEqual({ hasMore: true, nextCursor: "cursor-2" });
  });

  it("forwards the cursor param when fetching the next page", async () => {
    let receivedCursor: string | null = null;
    server.use(
      http.get(`${BASE_URL}/products`, ({ request }) => {
        receivedCursor = new URL(request.url).searchParams.get("cursor");
        return HttpResponse.json({ data: [], pageInfo: { hasMore: false, nextCursor: null } });
      }),
    );

    const endpoints = createCatalogEndpoints(createApiClient(BASE_URL));
    await endpoints.listProducts({ cursor: "cursor-2" });

    expect(receivedCursor).toBe("cursor-2");
  });

  it("reports hasMore: false with no nextCursor on the last page", async () => {
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({
          data: [productFixture()],
          pageInfo: { hasMore: false, nextCursor: null },
        }),
      ),
    );

    const endpoints = createCatalogEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.listProducts({ cursor: "cursor-2" });

    expect(result.pageInfo.hasMore).toBe(false);
  });
});

describe("getProductBySlug", () => {
  it("parses a product detail response nested under .data.data, including category/brand", async () => {
    server.use(
      http.get(`${BASE_URL}/products/test-product`, () =>
        HttpResponse.json({
          data: productFixture({
            category: {
              id: CATEGORY_ID,
              parentId: null,
              name: "Category",
              slug: "category",
              countryCode: "SL",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
              deletedAt: null,
            },
            brand: null,
          }),
        }),
      ),
    );

    const endpoints = createCatalogEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.getProductBySlug("test-product");

    expect(result.category.slug).toBe("category");
    expect(result.brand).toBeNull();
  });

  it("surfaces a 404 as an ApiError, not a raw axios error", async () => {
    server.use(
      http.get(`${BASE_URL}/products/does-not-exist`, () =>
        HttpResponse.json(
          { error: { code: "PRODUCT_NOT_FOUND", message: "Not found", correlationId: "c-3" } },
          { status: 404 },
        ),
      ),
    );

    const endpoints = createCatalogEndpoints(createApiClient(BASE_URL));

    await expect(endpoints.getProductBySlug("does-not-exist")).rejects.toBeInstanceOf(ApiError);
    await expect(endpoints.getProductBySlug("does-not-exist")).rejects.toMatchObject({
      code: "PRODUCT_NOT_FOUND",
    });
  });
});
