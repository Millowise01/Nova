export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES: Locale[] = ["ar"];

export const USER_ROLES = ["customer", "seller", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COOKIE_KEYS = {
  session: "nova_session",
  theme: "nova_theme",
  locale: "nova_locale",
} as const;

export const QUERY_STALE_TIME = {
  short: 30_000,       // 30s — volatile data (cart, notifications)
  medium: 5 * 60_000,  // 5m  — catalog listings
  long: 30 * 60_000,   // 30m — static content (categories, brands)
} as const;
