import type { MongoAbility } from "@casl/ability";
import type { Order, Product, Wishlist } from "@prisma/client";

/**
 * Central RBAC/ABAC policy engine — Vol 3, B3 / Vol 2, B2 point 5 ("no module
 * implements ad hoc permission checks"). One ability definition, consumed by every
 * module via PolicyGuard (route-level, coarse/RBAC) and directly via AbilityFactory
 * (service-level, fine/ABAC — condition checks against a specific fetched row, tagged
 * with CASL's `subject()` helper so a plain Prisma result can be checked without
 * needing a class instance).
 *
 * Subjects that need field-level ABAC conditions (Product.sellerId, Order.userId) are
 * unioned with their actual Prisma row type, per CASL's documented pattern — that's
 * what lets `can('update', 'Product', { sellerId: user.id })` type-check the condition
 * against Product's real shape.
 */
export type PolicyAction =
  "create" | "read" | "update" | "delete" | "cancel" | "approve" | "manage";
export type PolicySubject =
  | "Product"
  | Product
  | "Category"
  | "Brand"
  | "Order"
  | Order
  | "Cart"
  | "RefundRequest"
  | "Wishlist"
  | Wishlist
  | "all";

export type AppAbility = MongoAbility<[PolicyAction, PolicySubject]>;

/** The string-only subset — what a route-level @RequirePermission decorator declares
 *  (it checks a subject TYPE, not a specific fetched row). */
export type PolicySubjectTag =
  "Product" | "Category" | "Brand" | "Order" | "Cart" | "RefundRequest" | "Wishlist" | "all";

export interface PolicyUser {
  id: string;
  roles: string[];
}
