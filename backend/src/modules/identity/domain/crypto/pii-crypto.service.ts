import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { AppConfigService } from "../../../../config/config.service";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended nonce length for GCM

/**
 * Field-level PII encryption — Vol 2, D3: "Field-level encryption for phone numbers,
 * email addresses, and government ID numbers... so a database-level compromise alone
 * does not expose raw PII." AES-256-GCM for reversible storage, HMAC-SHA256 for a
 * deterministic lookup hash (email/phone need a unique, queryable index — you can't
 * index a value encrypted with a random IV).
 *
 * Two independent subkeys are derived (via HKDF) from the single PII_ENCRYPTION_KEY env
 * var, so the encryption key and the hash key are never the same bytes even though they
 * originate from one secret.
 */
@Injectable()
export class PiiCryptoService {
  private readonly encryptionKey: Buffer;
  private readonly hashKey: Buffer;

  constructor(config: AppConfigService) {
    const masterKey = Buffer.from(config.get("PII_ENCRYPTION_KEY"), "base64");
    this.encryptionKey = Buffer.from(
      hkdfSync("sha256", masterKey, Buffer.alloc(0), Buffer.from("nova-pii-encrypt"), 32),
    );
    this.hashKey = Buffer.from(
      hkdfSync("sha256", masterKey, Buffer.alloc(0), Buffer.from("nova-pii-hash"), 32),
    );
  }

  /** Returns base64(iv || authTag || ciphertext). */
  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
  }

  decrypt(encoded: string): string {
    const buffer = Buffer.from(encoded, "base64");
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
    const ciphertext = buffer.subarray(IV_LENGTH + 16);
    const decipher = createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  }

  /** Deterministic — same input always produces the same hash, so it can be used as a
   *  unique index for lookup (e.g. "does a user with this email already exist"). */
  hash(value: string): string {
    return createHmac("sha256", this.hashKey).update(value.trim().toLowerCase()).digest("hex");
  }
}
