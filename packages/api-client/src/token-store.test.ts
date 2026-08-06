import { beforeEach, describe, expect, it } from "vitest";

import { tokenStore } from "./token-store";

// tokenStore is a module-level singleton (see token-store.ts's design comment) —
// every test here resets it explicitly rather than assuming a fresh instance,
// since Vitest only isolates module registries per FILE, not per test.
beforeEach(() => {
  tokenStore.clear();
  window.localStorage.clear();
});

describe("tokenStore", () => {
  it("keeps the access token in memory only — it is never written to localStorage", () => {
    tokenStore.setTokens("access-1", "refresh-1");
    expect(tokenStore.getAccessToken()).toBe("access-1");
    expect(window.localStorage.getItem("nova_access_token")).toBeNull();
    expect(Object.keys(window.localStorage)).not.toContain("access-1");
  });

  it("persists the refresh token to localStorage under a stable key", () => {
    tokenStore.setTokens("access-1", "refresh-1");
    expect(window.localStorage.getItem("nova_refresh_token")).toBe("refresh-1");
  });

  it("clear() wipes both the in-memory access token and the persisted refresh token", () => {
    tokenStore.setTokens("access-1", "refresh-1");
    tokenStore.clear();
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
    expect(window.localStorage.getItem("nova_refresh_token")).toBeNull();
  });

  it("notifies subscribers on both setTokens and clear, and stops after unsubscribe", () => {
    let notifications = 0;
    const unsubscribe = tokenStore.subscribe(() => {
      notifications += 1;
    });

    tokenStore.setTokens("access-1", "refresh-1");
    tokenStore.clear();
    expect(notifications).toBe(2);

    unsubscribe();
    tokenStore.setTokens("access-2", "refresh-2");
    expect(notifications).toBe(2);
  });
});
