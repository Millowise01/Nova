export const ROUTES = {
  home: "/",
  // Auth
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  logout: "/auth/logout",
  // Public catalog
  categories: "/categories",
  category: (slug: string) => `/categories/${slug}`,
  brands: "/brands",
  brand: (slug: string) => `/brands/${slug}`,
  deals: "/deals",
  flashSales: "/flash-sales",
  collections: "/collections",
  campaigns: "/campaigns",
  product: (slug: string) => `/product/${slug}`,
  sellerStore: (slug: string) => `/seller-store/${slug}`,
  // Cart & checkout
  cart: "/cart",
  checkout: "/checkout",
  // Dashboard (protected)
  account: "/account",
  orders: "/orders",
  order: (id: string) => `/orders/${id}`,
  wallet: "/wallet",
  settings: "/settings",
  notifications: "/notifications",
  aiAssistant: "/ai-assistant",
  sustainability: "/sustainability",
  support: "/support",
  // Search
  search: "/search",
  // Error pages
  forbidden: "/403",
  serverError: "/500",
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.account,
  ROUTES.checkout,
  ROUTES.wallet,
  ROUTES.orders,
  ROUTES.settings,
  ROUTES.notifications,
  ROUTES.aiAssistant,
  ROUTES.sustainability,
  ROUTES.support,
] as const;
