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
