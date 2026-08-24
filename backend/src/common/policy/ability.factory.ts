import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";

import type { AppAbility, PolicyUser } from "./policy.types";

/**
 * The single source of truth for "who can do what" (Vol 3, B3). Every rule below is
 * either:
 *   - RBAC (coarse): "sellers can create products" — checked without needing to fetch
 *     any specific row.
 *   - ABAC (fine): "sellers can update/delete only PRODUCTS THEY OWN" — the condition
 *     object (`{ sellerId: user.id }`) is matched against an actual fetched row via
 *     CASL's subject() helper at the service layer, not just at the route layer.
 *
 * This is the ONE place role -> permission mapping lives. A module that wants to check
 * "can this user do X" always goes through here — never a hand-rolled `if (role === ...)`.
 */
@Injectable()
export class AbilityFactory {
  buildFor(user: PolicyUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.roles.includes("admin")) {
      // RBAC: admin has unrestricted access — no ABAC condition needed at this role.
      can("manage", "all");
      return build();
    }

    if (user.roles.includes("seller")) {
      can("create", "Product"); // RBAC — any seller may create a product listing.
      can(["update", "delete"], "Product", { sellerId: user.id }); // ABAC — only their own.
    }

    // Every authenticated user, regardless of role, gets the customer-level rules below
    // — a seller is also allowed to shop.
    can("read", ["Product", "Category", "Brand"]);
    can("create", "Cart");
    can("create", "Order");
    can(["read", "cancel"], "Order", { userId: user.id }); // ABAC — only their own orders.
    // Wishlist: every authenticated user manages their own — the GET/POST routes are
    // inherently self-scoped (operate on "my wishlist", no ability check needed there,
    // same reasoning as Cart/Order creation above), but DELETE /wishlist/items/:id takes
    // an arbitrary item ID that could belong to someone else's wishlist, so that one DOES
    // check this condition via subject() at the service layer (mirrors OrdersService's
    // getOrder/cancelOrder pattern exactly).
    can(["create", "read", "delete"], "Wishlist", { userId: user.id });
    // Notifications: every authenticated user reads and marks-read only their own —
    // same ABAC shape as Order/Wishlist above. Nobody creates one via the API (they're
    // written by the outbox relay's event handlers, service-internal, not a user action).
    can(["read", "update"], "Notification", { userId: user.id });
    // Logistics (backend/docs/10): no separate "rider" role exists in Identity's model
    // (same shallow-role precedent as "seller" — a User.roles string, no dedicated
    // profile table). Any authenticated user can read/transition a DeliveryJob ONLY
    // when they're the assigned rider — the ABAC condition itself is what actually
    // restricts this, same pattern as Order's userId condition above. Assignment
    // (creating the job) is admin-only, gated at the route via RequirePermission.
    can(["read", "update"], "DeliveryJob", { riderId: user.id });
    // Trust & Safety (backend/docs/10): every authenticated user can open and read
    // their own disputes; adding a comment (an "update" — a new DisputeEvent) is
    // allowed on a dispute they opened too. Status changes beyond that are admin-only
    // (covered by admin's manage-all above, not granted here).
    can(["create", "read", "update"], "Dispute", { openedBy: user.id });

    return build();
  }
}
