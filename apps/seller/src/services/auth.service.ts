import { tokenStore } from "@nova/api-client";
import { decodeJwtPayload } from "@nova/app-shell";
import { type Session, sessionSchema } from "@nova/auth";
import type { AuthResponse, LoginInput } from "@nova/validation";

import { getApiClient } from "./api";

/** No seller signup flow — POST /v1/auth/signup hard-codes roles: ["customer"]
 *  (backend/src/modules/identity/domain/auth.service.ts), so there's no way to
 *  become a seller through the API. Same posture as apps/admin's auth.service.ts:
 *  seller accounts are promoted out of band; this service only ever logs an
 *  already-seller user in through the same /v1/auth/login endpoint apps/web and
 *  apps/admin already use. */

function sessionFromAuthResponse(auth: AuthResponse): Session {
  const { exp } = decodeJwtPayload(auth.accessToken);
  return sessionSchema.parse({
    userId: auth.user.id,
    roles: auth.user.roles,
    expiresAt: new Date(exp * 1000).toISOString(),
  });
}

export async function login(input: LoginInput): Promise<Session> {
  const auth = await getApiClient().auth.login(input);
  tokenStore.setTokens(auth.accessToken, auth.refreshToken);
  return sessionFromAuthResponse(auth);
}

/** Silent session restore on app boot — same reasoning as apps/web's and
 *  apps/admin's version (the access token is memory-only and doesn't survive a
 *  reload, the refresh token does). */
export async function restoreSession(): Promise<Session | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const client = getApiClient();
    const tokens = await client.auth.refresh(refreshToken);
    tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
    const { sub, roles, exp } = decodeJwtPayload(tokens.accessToken);
    return sessionSchema.parse({
      userId: sub,
      roles,
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  } catch {
    tokenStore.clear();
    return null;
  }
}

export function logout(): void {
  tokenStore.clear();
}
