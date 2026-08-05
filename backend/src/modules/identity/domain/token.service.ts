import { createHash, randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AppConfigService } from "../../../config/config.service";

export interface AccessTokenPayload {
  sub: string;
  roles: string[];
}

/**
 * Volume 3, Part B1: short-lived JWT access token (15-minute default expiry) with a
 * rotating, opaque refresh token. The refresh token is NOT a JWT — it's a high-entropy
 * random value whose hash is stored server-side (Session.refreshTokenHash), which is
 * what makes "any session can be force-terminated immediately" possible: revoking a
 * session is deleting/marking that one row, not something a stateless JWT can do.
 *
 * backend/docs/05-security-baseline.md proposes RS256 for the access token; this pass
 * uses HS256 shared secrets for simplicity (see the .env.example comment) — swap the
 * signing strategy before this leaves local development.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  issueAccessToken(payload: AccessTokenPayload): string {
    return this.jwt.sign(payload, {
      secret: this.config.get("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get("JWT_ACCESS_EXPIRY"),
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token, {
      secret: this.config.get("JWT_ACCESS_SECRET"),
    });
  }

  /** Returns the raw token (given to the client, never stored) and its hash (stored). */
  issueRefreshToken(): { token: string; hash: string } {
    const token = randomBytes(32).toString("base64url");
    return { token, hash: this.hashRefreshToken(token) };
  }

  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  refreshExpiryDate(): Date {
    const expiry = this.config.get("JWT_REFRESH_EXPIRY");
    const days = Number(expiry.replace("d", ""));
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
