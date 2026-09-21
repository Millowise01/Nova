export type JwtPayload = { sub: string; roles: string[]; exp: number };

/**
 * Decodes a JWT's payload WITHOUT verifying its signature. That is safe only because the token
 * has just come straight from a trusted response body (login or refresh): the result is a
 * client-side summary (`sub`, `roles`, `exp`) and is never used to authorize anything. Real
 * verification is the backend's job on every request.
 */
export function decodeJwtPayload(token: string): JwtPayload {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Malformed JWT: no payload segment");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64)) as JwtPayload;
}
