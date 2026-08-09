import { tokenStore } from "@nova/api-client";
import { type Session, sessionSchema } from "@nova/auth";
import type { AuthResponse, LoginInput, RegisterInput, UpdateMeInput } from "@nova/validation";

import { decodeJwtPayload } from "@/lib/decode-jwt";

import { getApiClient } from "./api";

function sessionFromAuthResponse(auth: AuthResponse): Session {
  const { exp } = decodeJwtPayload(auth.accessToken);
  return sessionSchema.parse({
    userId: auth.user.id,
    roles: auth.user.roles,
    expiresAt: new Date(exp * 1000).toISOString(),
  });
}

/** Real signup — stores tokens (in-memory access + localStorage refresh, see
 *  @nova/api-client/token-store) and returns the lightweight session summary
 *  for AuthProvider's cookie (apps/web/src/providers/auth-provider.tsx). */
export async function signup(input: RegisterInput): Promise<Session> {
  const auth = await getApiClient().auth.signup(input);
  tokenStore.setTokens(auth.accessToken, auth.refreshToken);
  return sessionFromAuthResponse(auth);
}

export async function login(input: LoginInput): Promise<Session> {
  const auth = await getApiClient().auth.login(input);
  tokenStore.setTokens(auth.accessToken, auth.refreshToken);
  return sessionFromAuthResponse(auth);
}

/** Silent session restore on app boot — the access token is memory-only and
 *  doesn't survive a page reload, but the refresh token does (localStorage).
 *  Returns null if there's no stored refresh token or it's no longer valid;
 *  callers treat that identically to "never logged in," not an error. */
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

/** No backend /auth/logout endpoint exists (confirmed against the live route
 *  table) — logout is purely client-side token/cookie clearing. */
export function logout(): void {
  tokenStore.clear();
}

export function getMe() {
  return getApiClient().auth.getMe();
}

export function updateMe(input: UpdateMeInput) {
  return getApiClient().auth.updateMe(input);
}
