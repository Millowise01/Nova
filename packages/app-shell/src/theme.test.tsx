import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme } from "./theme";

function Probe() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("light")}>light</button>
    </div>
  );
}

function stubMatchMedia(prefersDark: boolean) {
  const listeners = new Set<() => void>();
  const mediaQuery = {
    matches: prefersDark,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", () => mediaQuery);
  return {
    setPrefersDark(value: boolean) {
      mediaQuery.matches = value;
      listeners.forEach((listener) => listener());
    },
    listenerCount: () => listeners.size,
  };
}

function cookie(name: string) {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")[1];
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    for (const entry of document.cookie.split("; ")) {
      const name = entry.split("=")[0];
      if (name) document.cookie = `${name}=; path=/; max-age=0`;
    }
  });
  afterEach(() => vi.unstubAllGlobals());

  it("applies the system preference by default", () => {
    stubMatchMedia(true);
    render(
      <ThemeProvider storageKey="app_theme">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("persists a chosen theme under the storage key it was given: cookie and localStorage", () => {
    stubMatchMedia(false);
    render(
      <ThemeProvider storageKey="nova_seller_theme">
        <Probe />
      </ThemeProvider>,
    );
    act(() => screen.getByText("dark").click());

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
    expect(localStorage.getItem("nova_seller_theme")).toBe("dark");
    expect(cookie("nova_seller_theme")).toBe("dark");
  });

  it("two apps with different keys do not read or overwrite each other's preference", () => {
    stubMatchMedia(false);
    localStorage.setItem("nova_admin_theme", "dark");

    render(
      <ThemeProvider storageKey="nova_seller_theme">
        <Probe />
      </ThemeProvider>,
    );
    // The seller key was never set, so the admin preference must not leak in.
    expect(screen.getByTestId("theme")).toHaveTextContent("system");

    act(() => screen.getByText("light").click());
    expect(localStorage.getItem("nova_admin_theme")).toBe("dark");
    expect(localStorage.getItem("nova_seller_theme")).toBe("light");
  });

  it("restores the saved theme on mount, taking precedence over the initial theme", () => {
    stubMatchMedia(false);
    localStorage.setItem("nova_theme", "dark");
    render(
      <ThemeProvider storageKey="nova_theme" initialTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("follows the operating system while in system mode, and stops listening once a theme is chosen", () => {
    const media = stubMatchMedia(false);
    render(
      <ThemeProvider storageKey="app_theme">
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveClass("light");
    expect(media.listenerCount()).toBe(1);

    act(() => media.setPrefersDark(true));
    expect(document.documentElement).toHaveClass("dark");

    act(() => screen.getByText("light").click());
    expect(media.listenerCount()).toBe(0);
  });

  it("useTheme outside a provider fails loudly", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow("useTheme must be used within ThemeProvider");
    spy.mockRestore();
  });
});
