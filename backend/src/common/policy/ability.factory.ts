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

    return build();
  }
}
