import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ForbiddenError } from "../errors/api-error";
import type { AuthenticatedRequest } from "../guards/jwt-auth.guard";

import { AbilityFactory } from "./ability.factory";
import { REQUIRE_PERMISSION_KEY, type RequiredPermission } from "./require-permission.decorator";

/**
 * Route-level RBAC check — reads the @RequirePermission(action, subject) metadata and
 * asks the central AbilityFactory, never a controller-local `if`. Must run AFTER
 * JwtAuthGuard (needs req.user already populated). This is the "coarse" half of Vol 3,
 * B3's RBAC-then-ABAC layering; the "fine" half (does this user own THIS specific row)
 * happens in the service layer, since that requires a row this guard hasn't fetched.
 */
@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<RequiredPermission | undefined>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true; // no @RequirePermission on this route — nothing to check

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const ability = this.abilityFactory.buildFor({
      id: request.user.sub,
      roles: request.user.roles,
    });

    if (!ability.can(required.action, required.subject)) {
      throw new ForbiddenError(
        "PERMISSION_DENIED",
        `Your role does not permit "${required.action}" on "${required.subject}".`,
      );
    }

    return true;
  }
}
