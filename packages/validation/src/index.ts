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

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

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
  variants: z.array(createProductVariantSchema).min(1),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

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
  totalAmount: moneyAmountSchema,
  totalCurrency: currencyCodeSchema,
  status: z.string(),
  consumedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionSchema>;

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
