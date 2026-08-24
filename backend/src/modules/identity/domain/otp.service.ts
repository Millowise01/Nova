import { createHash, randomInt } from "node:crypto";

import { Injectable, Logger } from "@nestjs/common";

import { BadRequestError } from "../../../common/errors/api-error";
import { RedisService } from "../../../common/redis/redis.service";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60;
const OTP_KEY_PREFIX = "otp:";

/**
 * Redis-backed, not Postgres — backend/docs/03-database-conventions.md's storage-topology
 * table already scopes Redis to "transient session state" and Postgres to durable system-
 * of-record data; a 10-minute one-time code is the former, not the latter, so storing it in
 * Postgres was a mismatch this migration corrects. Redis's own TTL replaces the manual
 * `expiresAt`-column check, and a single `DEL` on successful verification replaces the
 * `consumedAt` marker — both are now structural (the key is simply gone) rather than a
 * flag an application query has to remember to filter on.
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly redis: RedisService) {}

  async requestOtp(destination: string): Promise<void> {
    const code = randomInt(0, 10 ** OTP_LENGTH)
      .toString()
      .padStart(OTP_LENGTH, "0");

    // Re-issuing a code overwrites any still-outstanding one for the same destination
    // (matches the previous Postgres version's "most recent wins" ordering).
    await this.redis.client.set(this.key(destination), this.hash(code), "EX", OTP_EXPIRY_SECONDS);

    // TODO: wire real SMS provider (Volume 5) at this integration point. In development
    // (and in this pass — there is no Volume 5 integration yet), the code is only ever
    // logged, never actually sent, per the confirmed decision for this implementation pass.
    this.logger.debug(
      `[OTP STUB] code for ${destination}: ${code} (expires in ${OTP_EXPIRY_SECONDS / 60}m)`,
    );
  }

  async verifyOtp(destination: string, code: string): Promise<void> {
    const key = this.key(destination);
    const storedHash = await this.redis.client.get(key);

    if (!storedHash || storedHash !== this.hash(code)) {
      throw new BadRequestError(
        "OTP_INVALID_OR_EXPIRED",
        "The OTP code is invalid or has expired.",
      );
    }

    // Single-use: delete on successful verification so the same code can never be replayed.
    await this.redis.client.del(key);
  }

  private key(destination: string): string {
    return `${OTP_KEY_PREFIX}${this.hash(destination.trim().toLowerCase())}`;
  }

  private hash(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
}
