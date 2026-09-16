/** Decodes a JWT's payload WITHOUT verifying its signature — safe here because the
 *  token just came straight from a trusted response body (login/refresh); this is
 *  never used to authorize anything, only to read `sub`/`roles`/`exp` for the
 *  lightweight client-side session summary. Real verification is the backend's job
 *  on every subsequent request. Identical to apps/web's and apps/admin's version —
 *  small enough that duplicating it beats introducing a cross-app shared module. */
export function decodeJwtPayload(token: string): { sub: string; roles: string[]; exp: number } {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Malformed JWT: no payload segment");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = typeof window === "undefined" ? atob(base64) : window.atob(base64);
  return JSON.parse(json) as { sub: string; roles: string[]; exp: number };
}
