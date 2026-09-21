import { describe, expect, it } from "vitest";

import { decodeJwtPayload } from "./jwt";

function base64url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function token(payload: unknown) {
  return `${base64url('{"alg":"none"}')}.${base64url(JSON.stringify(payload))}.signature`;
}

describe("decodeJwtPayload", () => {
  it("reads the subject, roles and expiry from the payload", () => {
    const payload = { sub: "user-1", roles: ["seller"], exp: 1_900_000_000 };
    expect(decodeJwtPayload(token(payload))).toEqual(payload);
  });

  it("decodes the URL-safe alphabet used by JWTs", () => {
    // ">>>???" encodes to characters that differ between base64 and base64url.
    const payload = { sub: ">>>???", roles: [], exp: 1 };
    expect(decodeJwtPayload(token(payload))).toEqual(payload);
  });

  it("throws on a token with no payload segment", () => {
    expect(() => decodeJwtPayload("not-a-jwt")).toThrow("Malformed JWT: no payload segment");
  });

  it("throws when the payload is not JSON", () => {
    expect(() => decodeJwtPayload(`a.${base64url("not json")}.c`)).toThrow();
  });

  it("does not verify anything: a forged token decodes, which is why the result is never used to authorize", () => {
    const forged = token({ sub: "someone-else", roles: ["admin"], exp: 1 });
    expect(decodeJwtPayload(forged).roles).toEqual(["admin"]);
  });
});
