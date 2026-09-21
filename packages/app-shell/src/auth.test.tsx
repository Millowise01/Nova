import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Session } from "@nova/auth";

import { AuthProvider, useAuth } from "./auth";
import { readCookie } from "./session-cookie";

const router = { refresh: vi.fn(), push: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const KEY = "nova_seller_session";
const session: Session = {
  userId: "user-1",
  roles: ["seller"],
  expiresAt: "2030-01-01T00:00:00.000Z",
};
const encoded = (value: unknown) => encodeURIComponent(JSON.stringify(value));

function Probe() {
  const { session: current, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{current?.userId ?? "none"}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <button onClick={() => login(session)}>login</button>
      <button onClick={() => login({ userId: "" } as unknown as Session)}>bad-login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderAuth(
  props: Partial<Parameters<typeof AuthProvider>[0]> & {
    restoreSession?: () => Promise<Session | null>;
  } = {},
) {
  const clearTokens = vi.fn();
  const restoreSession = props.restoreSession ?? vi.fn().mockResolvedValue(null);
  render(
    <AuthProvider
      sessionCookieKey={KEY}
      afterLogoutPath="/login"
      restoreSession={restoreSession}
      clearTokens={clearTokens}
      initialSession={props.initialSession ?? null}
    >
      <Probe />
    </AuthProvider>,
  );
  return { clearTokens, restoreSession };
}

function wipeCookies() {
  for (const entry of document.cookie.split("; ")) {
    const name = entry.split("=")[0];
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  }
}

describe("AuthProvider", () => {
  beforeEach(() => {
    wipeCookies();
    router.refresh.mockReset();
    router.push.mockReset();
  });
  afterEach(() => vi.restoreAllMocks());

  it("starts from the session the server rendered with", () => {
    renderAuth({ initialSession: session });
    expect(screen.getByTestId("user")).toHaveTextContent("user-1");
    expect(screen.getByTestId("auth")).toHaveTextContent("true");
  });

  it("starts signed out without one", () => {
    renderAuth();
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });

  it("login keeps the session in state and in the app's own cookie, then refreshes the route", () => {
    renderAuth();
    act(() => screen.getByText("login").click());

    expect(screen.getByTestId("user")).toHaveTextContent("user-1");
    expect(readCookie(KEY)).toBe(encoded(session));
    expect(router.refresh).toHaveBeenCalled();
  });

  it("login with an invalid session changes nothing", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderAuth();
    act(() => screen.getByText("bad-login").click());

    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(readCookie(KEY)).toBeNull();
    expect(error).toHaveBeenCalled();
  });

  it("logout clears the tokens and the cookie, and leaves for the configured page", () => {
    const { clearTokens } = renderAuth({ initialSession: session });
    act(() => screen.getByText("login").click());
    act(() => screen.getByText("logout").click());

    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(readCookie(KEY)).toBeNull();
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(router.push).toHaveBeenCalledWith("/login");
  });

  it("sends the user to the page each app configures after logout", () => {
    render(
      <AuthProvider
        sessionCookieKey="nova_session"
        afterLogoutPath="/"
        restoreSession={vi.fn().mockResolvedValue(null)}
        clearTokens={vi.fn()}
        initialSession={session}
      >
        <Probe />
      </AuthProvider>,
    );
    act(() => screen.getByText("logout").click());
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("on boot, restores a session from the cookie and then refreshes it through the API", async () => {
    document.cookie = `${KEY}=${encoded(session)}; path=/`;
    const renewed: Session = { ...session, expiresAt: "2031-01-01T00:00:00.000Z" };
    const { restoreSession } = renderAuth({ restoreSession: vi.fn().mockResolvedValue(renewed) });

    expect(screen.getByTestId("user")).toHaveTextContent("user-1");
    await waitFor(() => expect(readCookie(KEY)).toBe(encoded(renewed)));
    expect(restoreSession).toHaveBeenCalledTimes(1);
  });

  it("on boot, drops a cookie that is not a valid session", async () => {
    document.cookie = `${KEY}=${encodeURIComponent("junk")}; path=/`;
    renderAuth();
    await waitFor(() => expect(readCookie(KEY)).toBeNull());
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });

  it("on boot, signs out when a cookie claims a session the refresh token can no longer back", async () => {
    document.cookie = `${KEY}=${encoded(session)}; path=/`;
    const { clearTokens } = renderAuth({ restoreSession: vi.fn().mockResolvedValue(null) });

    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("false"));
    expect(clearTokens).toHaveBeenCalled();
    expect(readCookie(KEY)).toBeNull();
    expect(router.push).toHaveBeenCalledWith("/login");
  });

  it("on boot, does nothing dramatic when there was no cookie and nothing to restore", async () => {
    const { restoreSession, clearTokens } = renderAuth();
    await waitFor(() => expect(restoreSession).toHaveBeenCalled());
    expect(clearTokens).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("a sign-out while the boot-time restore is still running is not undone when it finishes", async () => {
    // Found by a browser test: after a reload the page renders signed in straight away while the
    // refresh runs in the background, so "Sign out" can be clicked before it returns. The restore
    // then stored fresh tokens and signed the user back in.
    document.cookie = `${KEY}=${encoded(session)}; path=/`;
    let finishRestore: (restored: Session | null) => void = () => undefined;
    const restoreSession = vi.fn(
      () =>
        new Promise<Session | null>((resolve) => {
          finishRestore = resolve;
        }),
    );
    const { clearTokens } = renderAuth({ restoreSession });

    act(() => screen.getByText("logout").click());
    expect(clearTokens).toHaveBeenCalledTimes(1);

    await act(() => {
      finishRestore({ ...session, expiresAt: "2031-01-01T00:00:00.000Z" });
      return Promise.resolve();
    });

    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(readCookie(KEY)).toBeNull();
    // The tokens the restore stored on its way are dropped again.
    expect(clearTokens).toHaveBeenCalledTimes(2);
  });

  it("only reads and writes the cookie it was given", () => {
    document.cookie = `nova_admin_session=${encoded({ ...session, userId: "someone-else" })}; path=/`;
    renderAuth();
    expect(screen.getByTestId("user")).toHaveTextContent("none");
    act(() => screen.getByText("login").click());
    expect(readCookie("nova_admin_session")).toBe(encoded({ ...session, userId: "someone-else" }));
  });

  it("useAuth outside a provider fails loudly", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow("useAuth must be used within AuthProvider");
  });
});
