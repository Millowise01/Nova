import { randomUUID } from "node:crypto";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();
const SELLER_ID = randomUUID();
const CATEGORY_ID = randomUUID();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ session: { userId: SELLER_ID, roles: ["seller"] } }),
}));

import { CatalogScreen } from "./catalog-screen";

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova Seller";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function productFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    sellerId: SELLER_ID,
    categoryId: CATEGORY_ID,
    brandId: null,
    title: "Existing Product",
    slug: "existing-product",
    description: null,
    status: "published",
    countryCode: "SL",
    isFeatured: false,
    isFlashSale: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    deletedAt: null,
    variants: [
      {
        id: randomUUID(),
        productId: randomUUID(),
        sku: "SKU-1",
        name: "Default",
        priceAmount: "9.99",
        priceCurrency: "SLE",
        stockQuantity: 3,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        deletedAt: null,
      },
    ],
    ...overrides,
  };
}

describe("CatalogScreen", () => {
  it("lists only the logged-in seller's own products via GET /products?sellerId=", async () => {
    let requestedSellerId: string | null = null;
    server.use(
      http.get(`${BASE_URL}/products`, ({ request }) => {
        requestedSellerId = new URL(request.url).searchParams.get("sellerId");
        return HttpResponse.json({
          data: [productFixture()],
          pageInfo: { hasMore: false, nextCursor: null },
        });
      }),
      http.get(`${BASE_URL}/categories`, () => HttpResponse.json({ data: [] })),
    );

    render(<CatalogScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    await waitFor(() => expect(screen.getByText("Existing Product")).toBeInTheDocument());
    expect(requestedSellerId).toBe(SELLER_ID);
  });

  it("discloses that edit/deactivate aren't available yet", () => {
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({ data: [], pageInfo: { hasMore: false, nextCursor: null } }),
      ),
      http.get(`${BASE_URL}/categories`, () => HttpResponse.json({ data: [] })),
    );

    render(<CatalogScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });
    expect(
      screen.getByText(/editing and deactivating a listing aren't available yet/i),
    ).toBeInTheDocument();
  });

  it("creates a product with a single variant and the caller's own scoping, then refreshes the list", async () => {
    let created = false;
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({
          data: created ? [productFixture({ title: "New Product" })] : [],
          pageInfo: { hasMore: false, nextCursor: null },
        }),
      ),
      http.get(`${BASE_URL}/categories`, () =>
        HttpResponse.json({
          data: [
            {
              id: CATEGORY_ID,
              parentId: null,
              name: "Category One",
              slug: "cat",
              countryCode: "SL",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
              deletedAt: null,
            },
          ],
        }),
      ),
      http.post(`${BASE_URL}/products`, async ({ request }) => {
        const body = (await request.json()) as { title: string; variants: unknown[] };
        expect(body.title).toBe("New Product");
        expect(body.variants).toHaveLength(1);
        created = true;
        return HttpResponse.json({ data: productFixture({ title: "New Product" }) });
      }),
    );

    const user = userEvent.setup();
    render(<CatalogScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    await waitFor(() => expect(screen.getByText("Category One")).toBeInTheDocument());
    await user.type(screen.getByLabelText(/^title$/i), "New Product");
    await user.selectOptions(screen.getByLabelText(/category/i), CATEGORY_ID);
    await user.type(screen.getByLabelText(/price/i), "9.99");
    await user.type(screen.getByLabelText(/stock quantity/i), "3");
    await user.click(screen.getByRole("button", { name: /list product/i }));

    await waitFor(() => expect(screen.getByText("New Product")).toBeInTheDocument());
  });
});
