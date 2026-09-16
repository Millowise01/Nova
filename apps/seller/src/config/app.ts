// apps/seller has no locale routing (unlike apps/web) — deliberately smaller
// than apps/web/src/config/app.ts, not a partial copy of it. Mirrors
// apps/admin/src/config/app.ts's shape exactly, for the seller role instead.

export const COOKIE_KEYS = {
  session: "nova_seller_session",
  theme: "nova_seller_theme",
} as const;

export const QUERY_STALE_TIME = {
  short: 30_000, // 30s — things that change from another actor (KYC status, orders)
  medium: 5 * 60_000,
} as const;

/** The one role this entire app is gated on (backend/docs/05-security-baseline.md's
 *  disclosed role-model gap, same as apps/admin — no sub-role distinction exists). */
export const SELLER_ROLE = "seller" as const;
