import { refreshAccessToken, tokenStore } from "@nova/api-client";
import type { NovaApiClient } from "@nova/api-client";
import { type Session, sessionSchema } from "@nova/auth";
import type { AuthResponse, LoginInput } from "@nova/validation";

import { decodeJwtPayload } from "./jwt";

/**
 * The session flows every app shares, over that app's own API client. Tokens follow the strategy
 * documented in @nova/api-client: the access token stays in memory, the refresh token in
 * localStorage. `getApiClient` is a parameter because each app owns its client singleton.
 */
export function createSessionService(getApiClient: () => NovaApiClient) {
  function sessionFromAuthResponse(auth: AuthResponse): Session {
    const { exp } = decodeJwtPayload(auth.accessToken);
    return sessionSchema.parse({
      userId: auth.user.id,
      roles: auth.user.roles,
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  }

  async function login(input: LoginInput): Promise<Session> {
    const auth = await getApiClient().auth.login(input);
    tokenStore.setTokens(auth.accessToken, auth.refreshToken);
    return sessionFromAuthResponse(auth);
  }

  /**
   * Silent restore on app boot: the access token does not survive a reload but the refresh token
   * does. Returns null when there is none or it is no longer accepted, which callers treat as
   * "signed out", not as an error.
   */
  async function restoreSession(): Promise<Session | null> {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return null;

    try {
      // Through the client's shared single-flight refresh, not `auth.refresh` directly: a page that
      // fetches on mount can hit a 401 and refresh at the same moment, and the refresh token is
      // single-use, so a second, separate call fails and clears the tokens. This also stores the
      // new tokens and clears them if the refresh fails.
      const accessToken = await refreshAccessToken(getApiClient().raw);
      const { sub, roles, exp } = decodeJwtPayload(accessToken);
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

  /** The backend has no logout endpoint, so signing out is clearing the client-side tokens. */
  function logout(): void {
    tokenStore.clear();
  }

  return { login, restoreSession, logout, sessionFromAuthResponse };
}
