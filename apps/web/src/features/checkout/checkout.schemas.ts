// Re-exported from @nova/validation — the canonical, backend-shared source (the same
// schema now validates POST /v1/carts/:cartId/checkout/session server-side). Do not
// redefine this schema locally; that duplication was already found and fixed once.
export { checkoutSchema, type CheckoutFormValues } from "@nova/validation";
