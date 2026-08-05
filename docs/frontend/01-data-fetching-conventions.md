# Data Fetching Conventions

Source: Nova Enterprise Blueprint, **Volume 2, Part A2** (React Query named as the frontend data-fetching layer: "React Query for resilient data fetching/caching"), **Volume 6, Part E3** (optimistic UI requirement), cross-referenced with `backend/docs/02-api-standards.md` (this repo's own backend contract) so the two don't drift apart independently.

## What's real today vs. what this doc establishes

`@tanstack/react-query` is installed and wired up in `apps/web` — a real `QueryClientProvider` exists (`src/providers/app-providers.tsx`), with a shared client instance (`src/hooks/use-query-client.ts`) and tiered stale-time config already defined in `src/config/app.ts`:

```typescript
export const QUERY_STALE_TIME = {
  short: 30_000, // 30s — volatile data (cart, notifications)
  medium: 5 * 60_000, // 5m  — catalog listings
  long: 30 * 60_000, // 30m — static content (categories, brands)
} as const;
```

But actual `useQuery` usage is thin — only two call sites exist in the whole app (`features/home/components/sections/recommendations-section.tsx`, `features/search/components/search-screen.tsx`), and both query against stub data (`Promise.resolve(products.slice(0, 4))`, a hardcoded array) rather than a real API, because there is no real API yet (`backend/` is a placeholder — see `backend/docs/00-bounded-contexts.md`). This doc establishes the conventions those two call sites already loosely follow, made explicit and consistent, for when real endpoints exist to call.

## Query keys

Current usage is a flat array, feature-first: `["home", "ai-recommendations"]`, `["search", "trending"]`. That's the right instinct (hierarchical, human-readable) but isn't yet a formal, repeatable convention — with only two call sites, nothing has forced one into existence.

> **Proposed, not yet confirmed — formal query key factory convention.** Adopt a per-feature key factory, colocated with the feature's query hooks, so every key for an entity is generated from one place instead of hand-typed at each call site (which is how key-based cache invalidation quietly breaks — a typo'd key just silently misses):
>
> ```typescript
> // features/orders/orders.keys.ts
> export const orderKeys = {
>   all: ["orders"] as const,
>   lists: () => [...orderKeys.all, "list"] as const,
>   list: (filters: OrderListFilters) => [...orderKeys.lists(), filters] as const,
>   details: () => [...orderKeys.all, "detail"] as const,
>   detail: (id: string) => [...orderKeys.details(), id] as const,
> };
> ```
>
> This is the standard TanStack Query key-factory pattern, chosen because it makes "invalidate everything under `orders`" (`queryClient.invalidateQueries({ queryKey: orderKeys.all })`) and "invalidate just this one order" (`orderKeys.detail(id)`) both trivial and typo-proof, without inventing anything Nova-specific.

## Cache invalidation

No mutation-driven invalidation exists yet anywhere in the codebase (there are no `useMutation` call sites at all today — checkout's `onSubmit` is a bare `console.log`). The convention going forward:

- On a successful mutation, invalidate via the query key factory's broadest relevant node — a new order invalidates `orderKeys.lists()` (the list is now stale) but not necessarily every individual `orderKeys.detail(id)` for unrelated orders.
- Prefer `invalidateQueries` (refetch from the server) over manually writing into the cache with `setQueryData`, **except** in the optimistic-update paths below, where a manual cache write is the entire point.
- Match `staleTime` to the `QUERY_STALE_TIME` tier that's already defined — a new query for cart contents uses `short` (30s), a new query for the category tree uses `long` (30m). Don't invent a fourth tier without a specific reason; three tiers covering "changes constantly," "changes sometimes," and "basically static" cover nearly everything.

## Optimistic updates (Vol 6, E3)

> "...optimistic UI updates for common actions (add to cart, save to wishlist) backed by the resilient data-fetching patterns in Volume 2, Part A2..."

This is a specific, named requirement — add-to-cart and wishlist actions must update the UI immediately, before the server confirms, and roll back cleanly if the server rejects. Neither feature is implemented yet (`CartScreen` is a `ModuleShell` placeholder — see [00-app-map.md](00-app-map.md)), so there's no existing pattern to document as "already established." Proposed shape, using React Query's standard `onMutate`/`onError`/`onSettled` triad:

```typescript
// features/cart/cart.mutations.ts (proposed shape — cart isn't built yet)
export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddToCartInput) => api.cart.addLine(input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.detail() });
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.detail());

      // Apply the change to the cache immediately — this is what makes it "optimistic."
      queryClient.setQueryData<Cart>(cartKeys.detail(), (cart) =>
        cart ? addLineOptimistically(cart, input) : cart,
      );

      return { previousCart }; // passed to onError as rollback context
    },

    onError: (_err, _input, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(), context.previousCart);
      }
      // Surface a toast (ToastProvider already exists — src/providers/toast-provider.tsx)
      // rather than a full error-state screen: the user's cart is visibly still usable,
      // an optimistic-update failure shouldn't feel like a page-level failure.
    },

    onSettled: () => {
      // Reconcile with the server's actual state either way.
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
```

The important discipline this pattern enforces: `onMutate` writes an _optimistic guess_, `onSettled` always reconciles against the real server response, and `onError` rolls back cleanly if the guess was wrong. A `console.log`-and-hope mutation (what `checkout-flow.tsx` currently has) is not this pattern and shouldn't be mistaken for a starting point when cart/wishlist get built.

## Loading / error / empty states

Three shared components already exist in `packages/design-system` for exactly this — use them, don't build ad hoc per-feature loading/error markup:

| State   | Component                                                              | Notes                                                                                                                            |
| ------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Loading | `Spinner` (`@nova/ui` / `@nova/design-system`)                         | Already used at both existing `useQuery` call sites (`query.isLoading ? <Spinner /> : ...`).                                     |
| Error   | `ErrorState` (`packages/design-system/src/components/error-state.tsx`) | `role="alert"`, takes `title`/`description`/`action`. Already token-correct (`var(--color-error)`, `var(--color-error-subtle)`). |
| Empty   | `EmptyState` (`packages/design-system/src/components/empty-state.tsx`) | Takes `icon`/`title`/`description`/`action` — for a successful query that returns zero results, not a query error.               |

Every `useQuery` call site should handle all three states explicitly — `isLoading` → `Spinner`, `isError` → `ErrorState`, `data.length === 0` (successful, empty) → `EmptyState`. Neither existing call site currently branches on `isError` (both only check `isLoading`) — that's a gap worth closing as soon as these queries hit a real, fallible API instead of a `Promise.resolve` that can't fail.

## Connecting to the backend contract

The backend's own conventions (`backend/docs/02-api-standards.md`) are the authority the frontend adapts to, not the other way around — this prevents the two from drifting into two different opinions about, say, what an error response looks like. Specifically:

- **Error shape**: the backend returns `{ error: { code, message, correlationId, details? } }` on failure. React Query's `onError` handlers should destructure exactly this shape — surfacing `error.message` to the user and logging `error.correlationId` alongside the client-side error for support/debugging traceability, per the backend doc's own reasoning for why `correlationId` exists.
- **Pagination**: the backend's proposed cursor format (opaque base64 JSON envelope, `nextCursor` in the response body) maps directly onto React Query's `useInfiniteQuery` — `getNextPageParam: (lastPage) => lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined`. Any unbounded list (orders, products, search results) should use `useInfiniteQuery`, not manual page-number state.
- **Idempotency**: for any mutation the backend doc marks as requiring an `Idempotency-Key` (checkout, order creation), the frontend generates the key once — at the start of the user's attempt, not per HTTP call — and reuses it across retries of _that same_ logical attempt, exactly matching the backend's stated contract ("a client retrying the same checkout attempt reuses the same key"). React Query's automatic retry (`retry: 1`, already the default in `use-query-client.ts`) is safe under this contract specifically _because_ the key doesn't change between the original attempt and the retry.

## Known risks in this area for Nova specifically

- **Query key sprawl without a factory.** With only two call sites today, nothing has forced key consistency yet. The moment cart, orders, and checkout all start querying, ad hoc keys (`["cart"]` in one file, `["cart-data"]` in another) will fragment the cache silently — invalidating one won't invalidate the other, and nobody will notice until a stale UI bug is reported.
- **Frontend inventing its own error/pagination/idempotency shape before the backend contract solidifies.** Both `backend/docs/02-api-standards.md`'s shapes are marked "proposed, not yet confirmed" themselves — if frontend work starts wiring real queries before those are confirmed, there's a real risk of the frontend's guess becoming the de facto contract by inertia, even though the backend doc is supposed to be the source of truth.
- **Optimistic UI is a named Vol 6 requirement with zero current implementation to check against.** When cart/wishlist are built, it would be easy to ship a naive `useMutation` without the `onMutate`/rollback triad and call it done — it'll look correct until the first network failure, which won't show up in a demo on a fast connection, only in the field on the mid-tier Android / variable-connectivity conditions Volume 1 explicitly designs for.
