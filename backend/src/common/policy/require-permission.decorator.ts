import { SetMetadata } from "@nestjs/common";

import type { PolicyAction, PolicySubjectTag } from "./policy.types";

export const REQUIRE_PERMISSION_KEY = "requirePermission";

export interface RequiredPermission {
  action: PolicyAction;
  subject: PolicySubjectTag;
}

/** Declares the coarse (RBAC) permission a route requires — read by PolicyGuard.
 *  Fine-grained (ABAC) checks against a specific fetched row still happen in the
 *  service layer via AbilityFactory directly (see OrdersService.getOrder). */
export const RequirePermission = (action: PolicyAction, subject: PolicySubjectTag) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { action, subject });
