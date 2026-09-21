import { tokenStore } from "@nova/api-client";
import { decodeJwtPayload } from "@nova/app-shell";
import { type Session, sessionSchema } from "@nova/auth";
import type { AuthResponse, LoginInput } from "@nova/validation";

import { getApiClient } from "./api";

/** No admin signup flow — there is no self-service "become an admin" endpoint
 *  (backend/docs/08: role assignment is a dual-authorization-gated operation with
 *  no API surface yet). Admin accounts are promoted directly, out of band; this
 *  service only ever logs an already-admin user in. */

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

/** Silent session restore on app boot — same reasoning as apps/web's version (the
 *  access token is memory-only and doesn't survive a reload, the refresh token does). */
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
