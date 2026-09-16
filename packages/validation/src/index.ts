import { z } from "zod";

export { z };

// ════════════════════════════════════════════════════════════
// Shared primitives
// ════════════════════════════════════════════════════════════

export const emailSchema = z.string().email();
export const phoneSchema = z.string().min(7);
export const urlSchema = z.string().url();

/** Money amount as a decimal string — matches @nova/types' Money.amount. Never a JS number. */
export const moneyAmountSchema = z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount");
export const currencyCodeSchema = z.enum(["SLE", "USD"]);

// ════════════════════════════════════════════════════════════
// Identity — auth request/response contracts.
// Canonical source for these shapes: both apps/web's forms AND the backend's
// controllers import from here. Redefining any of these locally is the exact
// duplication bug flagged in the frontend audit — don't repeat it.
// ════════════════════════════════════════════════════════════

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: emailSchema,
    phone: phoneSchema,
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  code: z.string().length(6),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Backend API contract only — no frontend form collects a destination + code in one step. */
export const otpRequestSchema = z.object({
  destination: z.union([emailSchema, phoneSchema]),
});
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

export const otpVerifySchema = z.object({
  destination: z.union([emailSchema, phoneSchema]),
  code: z.string().length(6),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

/** POST /v1/auth/otp and /v1/auth/otp/verify share this response shape — neither
 *  endpoint issues a session; verifying only confirms the destination, it doesn't
 *  log the caller in (see backend/src/modules/identity/http/auth.controller.ts). */
export const otpStatusResponseSchema = z.object({
  status: z.enum(["sent", "verified"]),
});
export type OtpStatusResponse = z.infer<typeof otpStatusResponseSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/** PATCH /v1/me — deliberately scoped to name/locale only. Email/phone are excluded
 *  on purpose (confirmed decision): changing either needs its own verify-then-change
 *  flow (propose new value, confirm via OTP, then swap) that doesn't exist yet, not a
 *  silent field update alongside name/locale. Both fields optional so a caller can
 *  patch just one. */
export const updateMeSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    locale: z.string().min(2).max(10).optional(),
  })
  .refine((value) => value.name !== undefined || value.locale !== undefined, {
    message: "At least one field (name or locale) must be provided",
  });
export type UpdateMeInput = z.infer<typeof updateMeSchema>;

// ════════════════════════════════════════════════════════════
// Catalog — backend API contracts (no frontend seller-portal form exists yet).
// ════════════════════════════════════════════════════════════

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase, alphanumeric, hyphen-separated"),
  parentId: z.string().uuid().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase, alphanumeric, hyphen-separated"),
});
export type CreateBrandInput = z.infer<typeof createBrandSchema>;

export const createProductVariantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  priceAmount: moneyAmountSchema,
  priceCurrency: currencyCodeSchema,
  stockQuantity: z.number().int().nonnegative(),
});
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase, alphanumeric, hyphen-separated"),
  description: z.string().optional(),
  // Merchandising flags — optional, default false at the schema/DB level. A seller
  // marks their own listing featured/flash-sale at creation time; there's no
  // separate moderation/approval step for either in this pass.
  isFeatured: z.boolean().optional(),
  isFlashSale: z.boolean().optional(),
  variants: z.array(createProductVariantSchema).min(1),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

/** Query params for GET /v1/products — cursor pagination plus the merchandising
 *  filters confirmed in scope (featured/flashSale booleans, sellerId for the seller
 *  storefront). Query strings arrive as raw strings, so booleans are parsed from the
 *  literal "true"/"false" rather than z.coerce.boolean() (which would treat the
 *  string "false" as truthy, since it's non-empty). */
export const listProductsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  flashSale: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  // Batch B — full-text search (Postgres tsvector/tsquery on title+description) and
  // price-range filtering. Both combine with the filters above (single query shape,
  // filtered/ranked differently), not a separate search endpoint.
  q: z.string().trim().min(1).max(200).optional(),
  minPrice: moneyAmountSchema.optional(),
  maxPrice: moneyAmountSchema.optional(),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

// ════════════════════════════════════════════════════════════
// Cart & Checkout
// ════════════════════════════════════════════════════════════

export const addCartLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
export type AddCartLineInput = z.infer<typeof addCartLineSchema>;

/** Canonical checkout form shape — shared verbatim between apps/web's CheckoutFlow and
 *  the backend's POST /v1/carts/:cartId/checkout/session. */
export const checkoutSchema = z.object({
  addressLine: z.string().min(3),
  city: z.string().min(2),
  district: z.string().min(2),
  phone: phoneSchema,
  deliveryMethod: z.enum(["standard", "express", "pickup"]),
  paymentMethod: z.enum(["wallet", "card", "mobile-money"]),
  promoCode: z.string().optional(),
});
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ════════════════════════════════════════════════════════════
// Wishlist
// ════════════════════════════════════════════════════════════

export const addWishlistItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
});
export type AddWishlistItemInput = z.infer<typeof addWishlistItemSchema>;

// ════════════════════════════════════════════════════════════
// Orders
// ════════════════════════════════════════════════════════════

export const createOrderSchema = z.object({
  checkoutSessionId: z.string().uuid(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).optional(),
});
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

// ════════════════════════════════════════════════════════════
// Payments & Wallet
// ════════════════════════════════════════════════════════════

export const proposeRefundSchema = z.object({
  paymentIntentId: z.string().uuid(),
  amount: moneyAmountSchema,
  reason: z.string().min(1),
});
export type ProposeRefundInput = z.infer<typeof proposeRefundSchema>;

export const rejectRefundSchema = z.object({
  reason: z.string().min(1),
});
export type RejectRefundInput = z.infer<typeof rejectRefundSchema>;

/** GET /v1/wallet/refunds — admin review queue (backend/docs/10's disclosed addition,
 *  built alongside apps/admin). Unpaginated by design, same as GET /v1/categories —
 *  a small, bounded admin queue, not an unbounded list per backend/docs/02's
 *  pagination rule. */
export const listRefundsQuerySchema = z.object({
  status: z.enum(["proposed", "approved", "rejected", "executed"]).optional(),
});
export type ListRefundsQuery = z.infer<typeof listRefundsQuerySchema>;

// ════════════════════════════════════════════════════════════
// Notifications
// ════════════════════════════════════════════════════════════

/** GET /v1/notifications query params. */
export const listNotificationsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

// ════════════════════════════════════════════════════════════
// Response schemas — the frontend's shared source of truth for what the real
// backend actually returns. Shapes below are captured directly from live
// requests against a running backend (not assumed from controller reading),
// including two real, deliberately-preserved backend inconsistencies:
//   - POST /orders returns Money as nested { amount, currency } objects;
//     GET /orders and GET /orders/:id return the flat Prisma-row shape
//     (totalAmount + totalCurrency as separate string fields). Two different
//     schemas below reflect this rather than papering over it.
//   - There is no GET /categories or GET /brands list endpoint — only POST
//     (create) exists for both. Categories/brands are only otherwise
//     observable nested inside a product detail response.
// ════════════════════════════════════════════════════════════

export const moneySchema = z.object({
  amount: moneyAmountSchema,
  currency: currencyCodeSchema,
});
export type MoneyResponse = z.infer<typeof moneySchema>;

export const pageInfoSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().nullable().optional(),
});

// ─── Identity ──────────────────────────────────────────────

export const userSchema = z.object({
  id: z.string().uuid(),
  roles: z.array(z.string()),
});
export type UserResponse = z.infer<typeof userSchema>;

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type AuthTokensResponse = z.infer<typeof authTokensSchema>;

/** POST /v1/auth/signup and POST /v1/auth/login both return this shape. */
export const authResponseSchema = authTokensSchema.extend({ user: userSchema });
export type AuthResponse = z.infer<typeof authResponseSchema>;

/** POST /v1/auth/refresh — rotates both tokens, does NOT re-return `user`. */
export const refreshResponseSchema = authTokensSchema;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

/** GET /v1/me — the only endpoint that returns a user's own decrypted email/phone
 *  (read-only context on their own profile page; PATCH /v1/me cannot change either —
 *  see updateMeSchema above). */
export const meSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  email: emailSchema,
  phone: phoneSchema.nullable(),
  locale: z.string(),
  roles: z.array(z.string()),
  countryCode: z.string(),
  createdAt: z.string(),
});
export type MeResponse = z.infer<typeof meSchema>;

/** GET /v1/sellers/:id — deliberately minimal: there is no dedicated Seller profile
 *  table in the schema today (only a "seller" role string on User), so this is just
 *  the public-safe subset of User fields. Never includes email/phone. */
export const sellerPublicProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  memberSince: z.string(),
});
export type SellerPublicProfileResponse = z.infer<typeof sellerPublicProfileSchema>;

// ─── Catalog ───────────────────────────────────────────────

export const categorySchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  countryCode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type CategoryResponse = z.infer<typeof categorySchema>;

/** GET /v1/categories — flat list, unpaginated (small bounded dataset, matches the
 *  existing GET /v1/orders precedent of no cursor envelope for non-product lists). */
export const categoryListResponseSchema = z.object({ data: z.array(categorySchema) });
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;

export const brandSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  countryCode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type BrandResponse = z.infer<typeof brandSchema>;

/** GET /v1/brands — same unpaginated shape as categories above. */
export const brandListResponseSchema = z.object({ data: z.array(brandSchema) });
export type BrandListResponse = z.infer<typeof brandListResponseSchema>;

export const variantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  priceAmount: moneyAmountSchema,
  priceCurrency: currencyCodeSchema,
  stockQuantity: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type VariantResponse = z.infer<typeof variantSchema>;

/** Shape returned by both GET /products (list) and GET /products/:slug (detail) —
 *  detail additionally nests `category` and `brand`, list does not. */
export const productSchema = z.object({
  id: z.string().uuid(),
  sellerId: z.string().uuid(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().nullable(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  countryCode: z.string(),
  isFeatured: z.boolean(),
  isFlashSale: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  variants: z.array(variantSchema),
});
export type ProductResponse = z.infer<typeof productSchema>;

export const productDetailSchema = productSchema.extend({
  category: categorySchema,
  brand: brandSchema.nullable(),
});
export type ProductDetailResponse = z.infer<typeof productDetailSchema>;

export const productListResponseSchema = z.object({
  data: z.array(productSchema),
  pageInfo: pageInfoSchema,
});
export type ProductListResponse = z.infer<typeof productListResponseSchema>;

// ─── Cart & Checkout ───────────────────────────────────────

export const cartCreateResponseSchema = z.object({
  cartId: z.string().uuid(),
  // null when the cart is created by an authenticated user (userId set instead) —
  // only guest cart creation gets a real guestToken. Confirmed against real
  // backend behavior: backend/src/modules/cart-checkout/domain/cart.service.ts.
  guestToken: z.string().nullable(),
});
export type CartCreateResponse = z.infer<typeof cartCreateResponseSchema>;

export const cartLineSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int(),
  unitPriceAmount: moneyAmountSchema,
  unitPriceCurrency: currencyCodeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type CartLineResponse = z.infer<typeof cartLineSchema>;

export const cartSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  lines: z.array(cartLineSchema),
  subtotal: moneySchema,
});
export type CartResponse = z.infer<typeof cartSchema>;

/** POST /v1/carts/:cartId/checkout/session — flat Prisma-row shape. */
export const checkoutSessionSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  addressLine: z.string(),
  city: z.string(),
  district: z.string(),
  phone: z.string(),
  deliveryMethod: z.string(),
  paymentMethod: z.string(),
  subtotalAmount: moneyAmountSchema,
  subtotalCurrency: currencyCodeSchema,
  promoCode: z.string().nullable(),
  discountAmount: moneyAmountSchema,
  shippingFeeAmount: moneyAmountSchema,
  totalAmount: moneyAmountSchema,
  totalCurrency: currencyCodeSchema,
  status: z.string(),
  consumedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionSchema>;

// ─── Wishlist ──────────────────────────────────────────────

export const wishlistItemSchema = z.object({
  id: z.string().uuid(),
  wishlistId: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
  // Enriched server-side via a synchronous call into Catalog's public service
  // (backend/docs/01-module-contract.md's cross-module read pattern) — null when
  // the product has since been deleted, so the frontend can render "no longer
  // available" without a broken link/N+1 lookup by (nonexistent) slug.
  product: z.object({ id: z.string().uuid(), title: z.string(), slug: z.string() }).nullable(),
});
export type WishlistItemResponse = z.infer<typeof wishlistItemSchema>;

export const wishlistSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(wishlistItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WishlistResponse = z.infer<typeof wishlistSchema>;

// ─── Orders ────────────────────────────────────────────────

/** POST /v1/orders response — Money fields are NESTED objects here only. */
export const orderCreateResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  total: moneySchema,
  subOrders: z.array(
    z.object({
      id: z.string().uuid(),
      sellerId: z.string().uuid(),
      status: z.string(),
      subtotal: moneySchema,
    }),
  ),
  paymentIntentId: z.string().uuid().nullable(),
  createdAt: z.string(),
});
export type OrderCreateResponse = z.infer<typeof orderCreateResponseSchema>;

export const subOrderSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  sellerId: z.string().uuid(),
  status: z.string(),
  subtotalAmount: moneyAmountSchema,
  subtotalCurrency: currencyCodeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type SubOrderResponse = z.infer<typeof subOrderSchema>;

/** GET /v1/orders and GET /v1/orders/:id — flat Prisma-row shape, distinct from
 *  the POST /v1/orders response above. */
export const orderSchema = z.object({
  id: z.string().uuid(),
  checkoutSessionId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  status: z.string(),
  totalAmount: moneyAmountSchema,
  totalCurrency: currencyCodeSchema,
  countryCode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  subOrders: z.array(subOrderSchema),
});
export type OrderResponse = z.infer<typeof orderSchema>;

/** PATCH /v1/orders/:id/cancel — a THIRD distinct order shape. The domain
 *  service's cancelOrder() returns a bare `tx.order.update()` result with no
 *  `subOrders` include (confirmed against backend/src/modules/orders/domain/
 *  orders.service.ts), unlike GET's orderSchema above. Callers that need
 *  subOrders after cancelling should invalidate/refetch via getOrder(), not
 *  trust this response to have them. */
export const orderCancelResponseSchema = orderSchema.omit({ subOrders: true });
export type OrderCancelResponse = z.infer<typeof orderCancelResponseSchema>;

// ─── Payments & Wallet ─────────────────────────────────────

/** GET /v1/wallet/balance — the only wallet read endpoint that exists today. */
export const walletBalanceSchema = moneySchema;
export type WalletBalanceResponse = z.infer<typeof walletBalanceSchema>;

// ─── Notifications ─────────────────────────────────────────

export const notificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  referenceType: z.string().nullable(),
  referenceId: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});
export type NotificationResponse = z.infer<typeof notificationSchema>;

export const notificationListResponseSchema = z.object({
  data: z.array(notificationSchema),
  pageInfo: pageInfoSchema,
  unreadCount: z.number().int().nonnegative(),
});
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;

// ════════════════════════════════════════════════════════════
// Logistics
// ════════════════════════════════════════════════════════════

export const createDeliveryZoneSchema = z.object({
  district: z.string().min(2),
  standardFeeAmount: moneyAmountSchema,
  expressFeeAmount: moneyAmountSchema,
  currency: currencyCodeSchema,
});
export type CreateDeliveryZoneInput = z.infer<typeof createDeliveryZoneSchema>;

export const assignDeliveryJobSchema = z.object({
  subOrderId: z.string().uuid(),
  riderId: z.string().uuid(),
});
export type AssignDeliveryJobInput = z.infer<typeof assignDeliveryJobSchema>;

export const deliverJobSchema = z.object({
  recipientName: z.string().min(1),
  note: z.string().optional(),
});
export type DeliverJobInput = z.infer<typeof deliverJobSchema>;

export const failDeliveryJobSchema = z.object({
  reason: z.string().min(1),
});
export type FailDeliveryJobInput = z.infer<typeof failDeliveryJobSchema>;

// ════════════════════════════════════════════════════════════
// Finance
// ════════════════════════════════════════════════════════════

export const proposeSellerPayoutSchema = z.object({
  sellerId: z.string().uuid(),
  amount: moneyAmountSchema,
  currency: currencyCodeSchema,
  reason: z.string().min(1),
});
export type ProposeSellerPayoutInput = z.infer<typeof proposeSellerPayoutSchema>;

export const rejectSellerPayoutSchema = z.object({
  reason: z.string().min(1),
});
export type RejectSellerPayoutInput = z.infer<typeof rejectSellerPayoutSchema>;

/** GET /v1/finance/payouts — admin review queue, same shape/rationale as
 *  listRefundsQuerySchema above. */
export const listSellerPayoutsQuerySchema = z.object({
  status: z.enum(["proposed", "approved", "rejected", "executed"]).optional(),
});
export type ListSellerPayoutsQuery = z.infer<typeof listSellerPayoutsQuerySchema>;

// ════════════════════════════════════════════════════════════
// Trust & Safety
// ════════════════════════════════════════════════════════════

export const submitKycSchema = z.object({
  subjectId: z.string().uuid(),
  subjectType: z.enum(["seller", "rider"]),
  documentReference: z.string().min(1),
});
export type SubmitKycInput = z.infer<typeof submitKycSchema>;

export const proposeKycDecisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});
export type ProposeKycDecisionInput = z.infer<typeof proposeKycDecisionSchema>;

export const suspendSellerSchema = z.object({
  reason: z.string().min(1),
});
export type SuspendSellerInput = z.infer<typeof suspendSellerSchema>;

/** GET /v1/trust-safety/kyc — admin review queue, same shape/rationale as
 *  listRefundsQuerySchema above. */
export const listKycQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});
export type ListKycQuery = z.infer<typeof listKycQuerySchema>;

/** GET /v1/trust-safety/suspension-requests — admin review queue, same shape. */
export const listSuspensionRequestsQuerySchema = z.object({
  status: z.enum(["proposed", "executed", "rejected"]).optional(),
});
export type ListSuspensionRequestsQuery = z.infer<typeof listSuspensionRequestsQuerySchema>;

export const openDisputeSchema = z.object({
  orderId: z.string().uuid().optional(),
  reviewId: z.string().uuid().optional(),
  reason: z.string().min(1),
});
export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;

export const addDisputeEventSchema = z.object({
  note: z.string().min(1),
});
export type AddDisputeEventInput = z.infer<typeof addDisputeEventSchema>;

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(1),
});
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;

/** GET /v1/trust-safety/disputes — admin-only "all disputes" queue (backend/docs/10's
 *  disclosed addition; the existing GET /disputes/:id ABAC read stays opener-or-admin,
 *  unrelated to this admin list). */
export const listDisputesQuerySchema = z.object({
  status: z.enum(["open", "resolved", "closed"]).optional(),
});
export type ListDisputesQuery = z.infer<typeof listDisputesQuerySchema>;

// ════════════════════════════════════════════════════════════
// apps/admin response shapes — flat Prisma-row shapes, same convention as
// checkoutSessionSchema. Added alongside the review-queue endpoints above
// (backend/docs/10's disclosed addition) since apps/admin is their first real
// consumer.
// ════════════════════════════════════════════════════════════

export const refundRequestSchema = z.object({
  id: z.string().uuid(),
  paymentIntentId: z.string().uuid(),
  amount: moneyAmountSchema,
  currency: currencyCodeSchema,
  reason: z.string(),
  status: z.enum(["proposed", "approved", "rejected", "executed"]),
  proposedBy: z.string().uuid(),
  approvedBy: z.string().uuid().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RefundRequestResponse = z.infer<typeof refundRequestSchema>;

export const sellerPayoutSchema = z.object({
  id: z.string().uuid(),
  sellerId: z.string().uuid(),
  amount: moneyAmountSchema,
  currency: currencyCodeSchema,
  reason: z.string(),
  status: z.enum(["proposed", "approved", "rejected", "executed"]),
  proposedBy: z.string().uuid(),
  approvedBy: z.string().uuid().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SellerPayoutResponse = z.infer<typeof sellerPayoutSchema>;

export const kycSubmissionSchema = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid(),
  subjectType: z.enum(["seller", "rider"]),
  documentReference: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  reviewProposedBy: z.string().uuid().nullable(),
  proposedDecision: z.enum(["approve", "reject"]).nullable(),
  reviewConfirmedBy: z.string().uuid().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type KycSubmissionResponse = z.infer<typeof kycSubmissionSchema>;

export const sellerSuspensionRequestSchema = z.object({
  id: z.string().uuid(),
  sellerId: z.string().uuid(),
  action: z.enum(["suspend", "reinstate"]),
  reason: z.string(),
  status: z.enum(["proposed", "approved", "rejected", "executed"]),
  proposedBy: z.string().uuid(),
  approvedBy: z.string().uuid().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SellerSuspensionRequestResponse = z.infer<typeof sellerSuspensionRequestSchema>;

export const disputeEventSchema = z.object({
  id: z.string().uuid(),
  disputeId: z.string().uuid(),
  actorId: z.string().uuid(),
  eventType: z.enum(["opened", "comment", "status_changed", "resolved"]),
  note: z.string().nullable(),
  createdAt: z.string(),
});
export type DisputeEventResponse = z.infer<typeof disputeEventSchema>;

export const disputeSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid().nullable(),
  reviewId: z.string().uuid().nullable(),
  openedBy: z.string().uuid(),
  reason: z.string(),
  status: z.enum(["open", "resolved", "closed"]),
  resolution: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DisputeResponse = z.infer<typeof disputeSchema>;

/** GET /v1/trust-safety/disputes/:id — the flat Dispute row plus its DisputeEvent
 *  timeline (DisputeService.getForRequester spreads both into one object). */
export const disputeDetailSchema = disputeSchema.extend({
  events: z.array(disputeEventSchema),
});
export type DisputeDetailResponse = z.infer<typeof disputeDetailSchema>;
