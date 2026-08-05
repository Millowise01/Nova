import { randomBytes } from "node:crypto";

import { Test } from "@nestjs/testing";

import { AppConfigService } from "../../../../config/config.service";

import { PiiCryptoService } from "./pii-crypto.service";

describe("PiiCryptoService", () => {
  let service: PiiCryptoService;

  beforeAll(async () => {
    // Force a deterministic key for this test run regardless of what's in .env, so the
    // test never depends on unrelated environment state.
    process.env.PII_ENCRYPTION_KEY = randomBytes(32).toString("base64");

    const moduleRef = await Test.createTestingModule({
      providers: [PiiCryptoService, AppConfigService],
    }).compile();

    service = moduleRef.get(PiiCryptoService);
  });

  it("encrypts and decrypts back to the exact original plaintext", () => {
    const plaintext = "someone@example.com";
    const encrypted = service.encrypt(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(service.decrypt(encrypted)).toBe(plaintext);
  });

  it("produces a different ciphertext for the same plaintext each time (random IV)", () => {
    const a = service.encrypt("+23276000000");
    const b = service.encrypt("+23276000000");
    expect(a).not.toBe(b);
    expect(service.decrypt(a)).toBe(service.decrypt(b));
  });

  it("hash() is deterministic — required for the unique-lookup index to work", () => {
    expect(service.hash("Someone@Example.com")).toBe(service.hash("someone@example.com "));
  });

  it("hash() output never reveals the plaintext", () => {
    const hash = service.hash("someone@example.com");
    expect(hash).not.toContain("someone");
    expect(hash).toMatch(/^[a-f0-9]{64}$/); // hex-encoded SHA-256/HMAC digest
  });

  it("decrypting a tampered ciphertext throws rather than returning corrupted data", () => {
    const encrypted = service.encrypt("secret-value");
    const tampered = encrypted.slice(0, -4) + "aaaa";
    expect(() => service.decrypt(tampered)).toThrow();
  });
});
