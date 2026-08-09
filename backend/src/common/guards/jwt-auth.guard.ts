import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

// Deep import, not the "../../modules/identity" barrel — IdentityModule itself
// now has a controller (MeController) that needs this guard, which made the
// barrel import circular: identity.module.ts -> me.controller.ts ->
// jwt-auth.guard.ts -> identity's own barrel -> identity.module.ts (in
// progress). CommonJS resolves that circular require to a not-yet-populated
// module object, so IdentityPublicService silently came back `undefined` here
// — which is what actually caused "Nest can't resolve dependencies of the
// JwtAuthGuard", not a real DI wiring gap (confirmed by direct repro: removing
// the guard fixed bootstrap; adding it as an explicit provider did not, since
// the class reference itself was the problem, not its registration).
import { IdentityPublicService } from "../../modules/identity/public/identity.public-service";
import { UnauthorizedError } from "../errors/api-error";

export interface AuthenticatedRequest extends Request {
  user: { sub: string; roles: string[] };
}

/** Every module that needs "does this request have a valid session" uses this guard —
 *  it calls Identity's public service, never touches Identity's tables or JWT secret
 *  directly (backend/docs/01-module-contract.md's synchronous-call pattern). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly identity: IdentityPublicService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("MISSING_BEARER_TOKEN", "Authorization header is required.");
    }

    try {
      const payload = this.identity.verifyAccessToken(header.slice("Bearer ".length));
      request.user = { sub: payload.sub, roles: payload.roles };
      return true;
    } catch {
      throw new UnauthorizedError(
        "INVALID_ACCESS_TOKEN",
        "The access token is invalid or has expired.",
      );
    }
  }
}
