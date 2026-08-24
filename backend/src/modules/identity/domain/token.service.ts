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
 * backend/docs/05-security-baseline.md's RS256 proposal is now implemented: the access
 * token is signed with an RSA private key and verified with the matching public key, so
 * any future module or extracted microservice (Vol 2, Part F) can verify a token holding
 * only the public key, never the private signing key.
 */
@Injectable()
export class TokenService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {
    this.privateKey = Buffer.from(this.config.get("JWT_ACCESS_PRIVATE_KEY"), "base64").toString(
      "utf8",
    );
    this.publicKey = Buffer.from(this.config.get("JWT_ACCESS_PUBLIC_KEY"), "base64").toString(
      "utf8",
    );
  }

  issueAccessToken(payload: AccessTokenPayload): string {
    return this.jwt.sign(payload, {
      privateKey: this.privateKey,
      algorithm: "RS256",
      expiresIn: this.config.get("JWT_ACCESS_EXPIRY"),
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token, {
      publicKey: this.publicKey,
      algorithms: ["RS256"],
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
