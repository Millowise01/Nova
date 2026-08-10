import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClient } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

const routerReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { SearchScreen } from "./search-screen";

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function productFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    sellerId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    categoryId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    brandId: null,
    title: "Wireless Mouse",
    slug: "wireless-mouse",
    description: null,
    status: "published",
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

describe("SearchScreen", () => {
  it("renders no results and fires no request when the input is empty", () => {
    let requested = false;
    server.use(
      http.get(`${BASE_URL}/products`, () => {
        requested = true;
        return HttpResponse.json({ data: [], pageInfo: { hasMore: false, nextCursor: null } });
      }),
    );

    const queryClient = createTestQueryClient();
    render(<SearchScreen />, { wrapper: withQueryClient(queryClient) });

    expect(requested).toBe(false);
  });

  it("debounces typing, then fetches GET /products?q= and renders a real result", async () => {
    let receivedQ: string | null = null;
    server.use(
      http.get(`${BASE_URL}/products`, ({ request }) => {
        receivedQ = new URL(request.url).searchParams.get("q");
        return HttpResponse.json({
          data: [productFixture()],
          pageInfo: { hasMore: false, nextCursor: null },
        });
      }),
    );

    const queryClient = createTestQueryClient();
    const { getByLabelText } = render(<SearchScreen />, { wrapper: withQueryClient(queryClient) });

    const input = getByLabelText(/search products/i);
    userTypeInto(input, "mouse");

    await waitFor(() => expect(receivedQ).toBe("mouse"), { timeout: 2000 });
    await waitFor(() => expect(screen.getByText("Wireless Mouse")).toBeInTheDocument());
  });

  it("shows an empty state for a query with no matches", async () => {
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({ data: [], pageInfo: { hasMore: false, nextCursor: null } }),
      ),
    );

    const queryClient = createTestQueryClient();
    const { getByLabelText } = render(<SearchScreen />, { wrapper: withQueryClient(queryClient) });

    const input = getByLabelText(/search products/i);
    userTypeInto(input, "zzznonexistent");

    await waitFor(() => expect(screen.getByText(/no results/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
  });
});

/** Fires a single native input change — equivalent to userEvent.type without pulling
 *  in @testing-library/user-event's per-keystroke simulation, which isn't otherwise a
 *  dependency of this test file. */
function userTypeInto(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}
