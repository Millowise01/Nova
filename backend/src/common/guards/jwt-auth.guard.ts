import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { IdentityPublicService } from "../../modules/identity";
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
