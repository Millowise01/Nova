/**
 * Token storage strategy (confirmed by inspecting the real backend, not assumed):
 * auth.controller.ts's signup/login/refresh handlers return tokens in the JSON
 * response body — there is no `Set-Cookie` anywhere in the backend, so httpOnly
 * cookie auth isn't actually possible against this backend today, despite
 * `credentials: true` being set on CORS (that flag covers the existing
 * `nova_session` cookie apps/web/src/providers/auth-provider.tsx already
 * manages for route-guard purposes — see apps/web/middleware.ts — it is not
 * used for API auth).
 *
 * So: access token lives in memory only (module-level singleton below, never
 * persisted — safest against XSS, and short-lived enough that losing it on a
 * hard refresh just costs one silent /auth/refresh call). Refresh token is
 * persisted to localStorage so a page reload doesn't force a full re-login.
 * Both are separate from, and do not replace, the existing `nova_session`
 * cookie mechanism the route middleware depends on.
 */

const REFRESH_TOKEN_STORAGE_KEY = "nova_refresh_token";

type Listener = () => void;

class TokenStore {
  private accessToken: string | null = null;
  private listeners = new Set<Listener>();

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
    this.notify();
  }

  clear(): void {
    this.accessToken = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}

export const tokenStore = new TokenStore();
