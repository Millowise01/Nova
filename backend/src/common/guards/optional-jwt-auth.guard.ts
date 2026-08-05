import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { IdentityPublicService } from "../../modules/identity";

import type { AuthenticatedRequest } from "./jwt-auth.guard";

/** Populates req.user if a valid bearer token is present; never blocks the request if
 *  it's absent or invalid — for endpoints usable by both guests and authenticated
 *  users (Vol 2, C3: cart access is "Optional (session or JWT)"). */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly identity: IdentityPublicService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Partial<AuthenticatedRequest>>();
    const header = request.headers?.authorization;

    if (header?.startsWith("Bearer ")) {
      try {
        const payload = this.identity.verifyAccessToken(header.slice("Bearer ".length));
        (request as AuthenticatedRequest).user = { sub: payload.sub, roles: payload.roles };
      } catch {
        // Invalid token on an optional-auth route — proceed as a guest rather than 401.
      }
    }

    return true;
  }
}
