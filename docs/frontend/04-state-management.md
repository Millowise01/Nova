# State Management

No single blueprint section owns this topic — it's a synthesis of Vol 2, Part A2's stack choices (React Query specifically for _server_ state) and what's actually implemented in `apps/web`'s provider tree (`src/providers/app-providers.tsx`). This doc exists because the boundary between "server state" and "client state" is exactly the kind of thing that erodes silently if it's never written down — someone reaches for `useState` for something that should be a query, or builds a client store to cache something React Query already caches, and six months later nobody's sure which one is the source of truth.

## The boundary, in one sentence

**If it lives on a server and this app is just displaying/mutating a copy of it, it's server state (React Query). If it only exists because this specific browser tab is open right now, it's client state.** Genuinely ambiguous cases (see Cart, below) get resolved explicitly rather than left to whoever writes the code first to guess.

## Category 1 — Server state (React Query)

Anything whose actual source of truth is the backend — the response can go stale, another tab/device can change it, and this app's job is to fetch, cache, and eventually mutate a synced copy of it. This is what [01-data-fetching-conventions.md](01-data-fetching-conventions.md) covers in full detail; summarized here for the boundary itself.

**Worked example — search results** (`features/search/components/search-screen.tsx`, real, already implemented):

```typescript
const query = useQuery({
  queryKey: ["search", "trending"],
  queryFn: () => ["smartphone", "air fryer", "solar lamp", "running shoes"],
});
```

Nothing about "what's trending right now" belongs in this component's own state — it's a fact about the world (well, currently a stubbed fact, pending a real backend), fetched, cached with a stale-time, and re-fetched when it's stale. If this were `useState` + a `useEffect` fetch, every unmount/remount would lose the cache and every sibling component wanting the same data would have to fetch it again independently. That's the entire reason this category exists as its own bucket.

## Category 2 — Genuine client / UI state

State that has no server-side counterpart at all — it describes what _this browser tab_ is currently showing, not a fact about the world. Resets on reload without anyone caring, because there's nothing to lose.

**Worked example — drawer visibility** (`src/providers/drawer-provider.tsx`, real, already implemented):

```typescript
const [isOpen, setIsOpen] = useState(false);
const [content, setContent] = useState<ReactNode | null>(null);
// openDrawer(content, options) / closeDrawer() mutate this directly — no server round-trip,
// no cache, no staleness concept. It's just "is the drawer open right now."
```

`ModalProvider` follows the identical shape for modals. Neither belongs in React Query — there's no `queryFn` that would make sense here, because there's nothing to _fetch_. This is plain React Context + `useState`, which is sufficient at Nova's current scale; there's no client-state library (`zustand`, `jotai`) installed anywhere in the repo, and nothing in this doc set proposes adding one — the existing Context-per-concern pattern (`ThemeProvider`, `AuthProvider`, `DrawerProvider`, `ModalProvider`, `ToastProvider` — all in `src/providers/`) has handled every genuine client-state need so far without one.

## Category 3 — Persisted client preference state

A middle case worth naming explicitly: state that's client-owned (the app, not the backend, decides what it means) but persists across sessions via a cookie/`localStorage`, because losing it on every reload would be a bad experience even though it's not "data" in the server-state sense.

**Worked example — theme** (`src/providers/theme-provider.tsx`, real, already implemented): light/dark/system preference, written to both a cookie (so the server-rendered `<html>` tag can apply the right class _before_ any client JS runs — see `[locale]/layout.tsx`'s `className={rawTheme === "dark" ? "dark" : ""}`) and `localStorage` (so client-side reads don't need a round-trip). This is neither "ephemeral UI state" (it must survive a reload) nor "server state" (there's no `GET /v1/theme-preference` — Identity's `User` entity doesn't model this today, per `backend/docs/00-bounded-contexts.md`'s entity list). It's genuinely a third thing, and the theme provider's dual cookie+localStorage persistence is the concrete pattern for anything else that lands in this category.

## The ambiguous one — cart-in-progress

This is exactly the case that needs an explicit ruling instead of being left implicit, since `apps/web`'s current `CartScreen` is a `ModuleShell` placeholder with no real implementation to observe ([00-app-map.md](00-app-map.md)) — there's no existing code to point to as "already decided."

> **Proposed, not yet confirmed.** Split it, deliberately, into two different pieces that land in two different categories above:
>
> - **Cart _contents_** (line items, quantities, totals) are **Category 1 — server state.** Per `backend/docs/00-bounded-contexts.md` / Vol 2, D2: "`Cart` belongs to a `User` or a guest `Session`" — even an anonymous shopper has a `Session` record once one exists, so the cart's actual data lives in Postgres, not in this browser tab alone. The frontend holds a React-Query-cached copy, mutated **optimistically** (per [01-data-fetching-conventions.md](01-data-fetching-conventions.md)'s `onMutate`/`onError`/`onSettled` pattern) so "add to cart" feels instant, but the source of truth is still the backend `Cart` row, reconciled on every mutation settle.
> - **Cart _UI_ state** (is the cart drawer open, is a specific line item mid-edit) is **Category 2 — genuine client state**, and there's already a component ready to hold it: `DrawerProvider`. Opening the cart is just `openDrawer(<CartContents />)` — no new state container needed.
>
> Rationale for splitting rather than picking one bucket: treating cart contents as pure client state would mean a guest who adds items on their phone and later logs in on desktop loses everything, which directly contradicts Vol 6, A1's requirement that customers share "one account, one cart... regardless of which surface" they use. Treating the drawer's open/closed state as server state would be actively worse — there's no reason a browser reload should remember whether a drawer happened to be open.

## Locale — a state category that isn't state at all

Worth naming because it's easy to reach for `useState` here by habit: **the active locale is not client component state anywhere in this app.** It's derived from the URL (`[locale]` route segment), set via `next-intl`'s middleware, and read via `next-intl`'s `useTranslations()`/`getTranslations()` — routing state, not React state. See [07-localization.md](07-localization.md) for the full picture; noted here only to close off "which category does locale belong to" before someone invents a `LocaleProvider` that duplicates what the router already owns.

## Known risks in this area for Nova specifically

- **Cart contents built as pure client state** (e.g. `localStorage`-only) when it eventually gets implemented, because that's the fastest thing to ship and there's no backend to sync against yet — directly contradicting the shared-cart-across-devices requirement above. Worth catching in review specifically when cart work starts, since the placeholder `CartScreen` today gives zero signal either way.
- **A new client-state library getting introduced ad hoc** the first time someone hits a state-sharing problem Context doesn't solve elegantly, without checking whether the actual issue is that something was miscategorized as client state when it should have been a React Query cache instead. Most "I need global state for X" moments in a codebase already using React Query for server state are a sign of a miscategorization, not a sign Context is insufficient.
- **Seller and Admin re-deriving these same three categories independently** once they're built, rather than reusing this doc's boundary and `apps/web`'s existing provider patterns — same risk named in [03-routing-and-app-structure.md](03-routing-and-app-structure.md) and [05-design-system-usage.md](05-design-system-usage.md) for their respective concerns.
