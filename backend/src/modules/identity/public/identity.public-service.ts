import { Injectable } from "@nestjs/common";

import { NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";
import { TokenService, type AccessTokenPayload } from "../domain/token.service";

export interface PublicSellerProfile {
  id: string;
  name: string | null;
  memberSince: Date;
}

/** The ONLY way another module may interact with Identity — per
 *  backend/docs/01-module-contract.md. Other modules never import AuthService,
 *  PrismaService-scoped-to-Identity's-tables, or anything from domain/infra directly. */
@Injectable()
export class IdentityPublicService {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  /** Used by other modules' auth guards to verify a bearer token without needing to
   *  know anything about how Identity issues or stores it. */
  verifyAccessToken(token: string): AccessTokenPayload {
    return this.tokens.verifyAccessToken(token);
  }

  /** Backs Catalog's public seller storefront (GET /v1/sellers/:id) — deliberately
   *  the minimal public-safe subset of User, never email/phone. There's no dedicated
   *  Seller profile table in the schema today (only a "seller" role string on User),
   *  so this is what "seller public profile" means until one exists. */
  async getPublicSellerProfile(userId: string): Promise<PublicSellerProfile> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, roles: { has: "seller" } },
    });
    if (!user) throw new NotFoundError("SELLER_NOT_FOUND", "No seller found for this ID.");
    return { id: user.id, name: user.name, memberSince: user.createdAt };
  }
}
