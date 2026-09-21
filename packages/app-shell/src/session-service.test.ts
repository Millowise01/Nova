import { beforeEach, describe, expect, it, vi } from "vitest";

import { refreshAccessToken, tokenStore } from "@nova/api-client";
import type { NovaApiClient, NovaHttpClient } from "@nova/api-client";

import { createSessionService } from "./session-service";

function base64url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const EXP = 1_900_000_000;
const jwt = (payload: object) => `${base64url("{}")}.${base64url(JSON.stringify(payload))}.sig`;
const accessToken = jwt({ sub: "user-1", roles: ["seller"], exp: EXP });

const login = vi.fn();
// The refresh goes through @nova/api-client's shared single-flight function, which posts on the raw
// HTTP client; `refresh` stands in for that POST.
const refresh = vi.fn();
const rawClient = { post: refresh };
const getApiClient = () => ({ auth: { login }, raw: rawClient }) as unknown as NovaApiClient;

const refreshResponse = (access: string, next: string) => ({
  data: { data: { accessToken: access, refreshToken: next } },
});

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
    refresh.mockResolvedValue(refreshResponse(newAccess, "new-refresh"));

    const session = await service.restoreSession();

    expect(refresh).toHaveBeenCalledWith("/auth/refresh", { refreshToken: "old-refresh" });
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

  it("joins a refresh that is already in flight instead of making a second, doomed one", async () => {
    // The refresh token is single-use. After a reload the page may hit a 401 and refresh at the same
    // moment the session is restored; two separate calls made the second fail and cleared the tokens.
    tokenStore.setTokens("old-access", "old-refresh");
    let respond: (value: unknown) => void = () => undefined;
    refresh.mockReturnValue(new Promise((resolve) => (respond = resolve)));

    const fromInterceptor = refreshAccessToken(rawClient as unknown as NovaHttpClient);
    const restoring = service.restoreSession();
    respond(refreshResponse(jwt({ sub: "user-3", roles: [], exp: EXP }), "new-refresh"));

    expect((await restoring)?.userId).toBe("user-3");
    await fromInterceptor;
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("treats a token that cannot be decoded as a failed restore", async () => {
    tokenStore.setTokens("old-access", "old-refresh");
    refresh.mockResolvedValue(refreshResponse("not-a-jwt", "new-refresh"));

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
