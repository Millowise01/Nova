import { Injectable } from "@nestjs/common";

import { TokenService, type AccessTokenPayload } from "../domain/token.service";

/** The ONLY way another module may interact with Identity — per
 *  backend/docs/01-module-contract.md. Other modules never import AuthService,
 *  PrismaService-scoped-to-Identity's-tables, or anything from domain/infra directly. */
@Injectable()
export class IdentityPublicService {
  constructor(private readonly tokens: TokenService) {}

  /** Used by other modules' auth guards to verify a bearer token without needing to
   *  know anything about how Identity issues or stores it. */
  verifyAccessToken(token: string): AccessTokenPayload {
    return this.tokens.verifyAccessToken(token);
  }
}
