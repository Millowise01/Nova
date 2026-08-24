// apps/admin has no locale routing (unlike apps/web) — this is a deliberately
// smaller config than apps/web/src/config/app.ts, not a partial copy of it.

export const COOKIE_KEYS = {
  session: "nova_admin_session",
  theme: "nova_admin_theme",
} as const;

export const QUERY_STALE_TIME = {
  short: 30_000, // 30s — review queues (refunds, payouts, KYC, suspensions, disputes)
  medium: 5 * 60_000,
} as const;

/** The one role this entire app is gated on (backend/docs/05-security-baseline.md's
 *  disclosed role-model gap: Identity has no sub-role distinction beyond this). */
export const ADMIN_ROLE = "admin" as const;
