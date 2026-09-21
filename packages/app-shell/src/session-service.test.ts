import { beforeEach, describe, expect, it, vi } from "vitest";

import { tokenStore } from "@nova/api-client";
import type { NovaApiClient } from "@nova/api-client";

import { createSessionService } from "./session-service";

function base64url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const EXP = 1_900_000_000;
const jwt = (payload: object) => `${base64url("{}")}.${base64url(JSON.stringify(payload))}.sig`;
const accessToken = jwt({ sub: "user-1", roles: ["seller"], exp: EXP });

const login = vi.fn();
const refresh = vi.fn();
const getApiClient = () => ({ auth: { login, refresh } }) as unknown as NovaApiClient;

const service = createSessionService(getApiClient);

const authResponse = {
  accessToken,
  refreshToken: "refresh-1",
  user: { id: "user-1", roles: ["seller"] },
};

beforeEach(() => {
  login.mockReset();
  refresh.mockReset();
  tokenStore.clear();
});

describe("session service: login", () => {
  it("stores both tokens and returns the session summary, with expiry taken from the token", async () => {
    login.mockResolvedValue(authResponse);
    const session = await service.login({ email: "a@b.co", password: "pw" });

    expect(session).toEqual({
      userId: "user-1",
      roles: ["seller"],
      expiresAt: new Date(EXP * 1000).toISOString(),
    });
    expect(tokenStore.getAccessToken()).toBe(accessToken);
    expect(tokenStore.getRefreshToken()).toBe("refresh-1");
  });

  it("stores nothing when the request fails", async () => {
    login.mockRejectedValue(new Error("401"));
    await expect(service.login({} as never)).rejects.toThrow("401");
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});

describe("session service: restoreSession", () => {
  it("returns null without calling the API when there is no refresh token", async () => {
    expect(await service.restoreSession()).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("trades the refresh token for a new pair and a session", async () => {
    tokenStore.setTokens("old-access", "old-refresh");
    const newAccess = jwt({ sub: "user-2", roles: ["admin"], exp: EXP });
    refresh.mockResolvedValue({ accessToken: newAccess, refreshToken: "new-refresh" });

    const session = await service.restoreSession();

    expect(refresh).toHaveBeenCalledWith("old-refresh");
    expect(session).toEqual({
      userId: "user-2",
      roles: ["admin"],
      expiresAt: new Date(EXP * 1000).toISOString(),
    });
    expect(tokenStore.getRefreshToken()).toBe("new-refresh");
  });

  it("clears the stored tokens and returns null when the refresh is refused", async () => {
    tokenStore.setTokens("old-access", "old-refresh");
    refresh.mockRejectedValue(new Error("expired"));

    expect(await service.restoreSession()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
    expect(tokenStore.getAccessToken()).toBeNull();
  });

  it("treats a token that cannot be decoded as a failed restore", async () => {
    tokenStore.setTokens("old-access", "old-refresh");
    refresh.mockResolvedValue({ accessToken: "not-a-jwt", refreshToken: "new-refresh" });

    expect(await service.restoreSession()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});

describe("session service: logout and sessionFromAuthResponse", () => {
  it("logout clears both tokens", () => {
    tokenStore.setTokens("a", "r");
    service.logout();
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it("sessionFromAuthResponse is exposed so an app can add its own flows, such as signup", () => {
    expect(service.sessionFromAuthResponse(authResponse).userId).toBe("user-1");
  });
});
