import { expect, test, type Page } from "@playwright/test";

/**
 * Browser-level checks of the admin portal's authentication and navigation guard: sign-in, session
 * restoration, sign-out, and what the middleware does with signed-out visitors, unreadable and
 * forged cookies, the wrong role, and hostile `redirect` parameters.
 *
 * The role guard is a navigation aid, not authorization: the session cookie is written by the
 * browser and can be forged, and the backend authorizes every request from the access token. The
 * forged-cookie test below shows both halves of that.
 *
 * Accounts come from global-setup.ts.
 */
const SESSION_COOKIE = "nova_admin_session";
const REFRESH_TOKEN_KEY = "nova_refresh_token";
const PROTECTED_PATH = "/sellers";
const FORBIDDEN_HEADING = "You don't have access to Nova Admin";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

function credentials(kind: "staff" | "customer") {
  const email = kind === "staff" ? process.env.ADMIN_E2E_EMAIL : process.env.E2E_CUSTOMER_EMAIL;
  const password =
    kind === "staff" ? process.env.ADMIN_E2E_PASSWORD : process.env.E2E_CUSTOMER_PASSWORD;
  if (!email || !password) throw new Error("global-setup.ts did not provide the test accounts");
  return { email, password };
}

async function submitLogin(page: Page, kind: "staff" | "customer") {
  const { email, password } = credentials(kind);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function signIn(page: Page, kind: "staff" | "customer" = "staff") {
  await page.goto("/login");
  await submitLogin(page, kind);
}

const overview = (page: Page) => page.getByRole("heading", { name: "Overview" });

async function sessionCookie(page: Page) {
  return (await page.context().cookies()).find((cookie) => cookie.name === SESSION_COOKIE);
}

function loginRedirect(path: string) {
  return new RegExp(`/login\\?redirect=${encodeURIComponent(path)}$`);
}

test.describe("signing in and out", () => {
  test("a signed-out visitor is sent to the login page and back to where they were going", async ({
    page,
  }) => {
    await page.goto(PROTECTED_PATH);
    await expect(page).toHaveURL(loginRedirect(PROTECTED_PATH));

    await submitLogin(page, "staff");
    await expect(page).toHaveURL(new RegExp(`${PROTECTED_PATH}$`), { timeout: 15_000 });
  });

  test("the session survives a reload, and signing out ends it", async ({ page }) => {
    await signIn(page);
    await expect(overview(page)).toBeVisible({ timeout: 15_000 });
    expect(await sessionCookie(page)).toBeDefined();

    // Session restoration: the access token is memory-only, so a reload has to earn a new one
    // from the stored refresh token before the app can call the API again.
    await page.reload();
    await expect(overview(page)).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await sessionCookie(page)).toBeUndefined();
    expect(await page.evaluate((key) => localStorage.getItem(key), REFRESH_TOKEN_KEY)).toBeNull();

    // And the guard agrees: the protected area is closed again.
    await page.goto("/");
    await expect(page).toHaveURL(loginRedirect("/"));
  });
});

test.describe("the navigation guard", () => {
  test("a garbage session cookie counts as signed out", async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: SESSION_COOKIE, value: "garbage", url: baseURL! }]);
    await page.goto("/");
    await expect(page).toHaveURL(loginRedirect("/"));
  });

  test("a forged cookie claiming the right role opens nothing: the app drops it and the API ignores it", async ({
    page,
    baseURL,
    request,
  }) => {
    const forged = encodeURIComponent(
      JSON.stringify({
        userId: "00000000-0000-4000-8000-000000000000",
        roles: ["customer", "admin"],
        expiresAt: "2099-01-01T00:00:00.000Z",
      }),
    );
    await page.context().addCookies([{ name: SESSION_COOKIE, value: forged, url: baseURL! }]);

    // The middleware only reads the cookie, so it lets the navigation through; the client then
    // finds no refresh token to back the claim and signs the forged session out.
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
    expect(await sessionCookie(page)).toBeUndefined();

    // The backend is the boundary: the same cookie authorizes nothing there.
    const response = await request.get(`${API_BASE_URL}/me`, {
      headers: { cookie: `${SESSION_COOKIE}=${forged}` },
    });
    expect(response.status()).toBe(401);
  });

  test("a signed-in user without the admin role is sent to the forbidden page", async ({
    page,
  }) => {
    await signIn(page, "customer");
    await expect(page).toHaveURL(/\/forbidden$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: FORBIDDEN_HEADING })).toBeVisible();

    await page.goto(PROTECTED_PATH);
    await expect(page).toHaveURL(/\/forbidden$/);
  });

  test("an admin can open a protected page directly", async ({ page }) => {
    await signIn(page);
    await expect(overview(page)).toBeVisible({ timeout: 15_000 });

    await page.goto(PROTECTED_PATH);
    await expect(page).toHaveURL(new RegExp(`${PROTECTED_PATH}$`));
    await expect(page.getByRole("link", { name: "Seller Approval & Suspension" })).toBeVisible();
  });

  test("a path that only starts like a public one is not public", async ({ page }) => {
    await page.goto("/login-history");
    await expect(page).toHaveURL(loginRedirect("/login-history"));
  });
});

test.describe("hostile redirect parameters", () => {
  // A browser reads a backslash as a slash and drops tabs and newlines, so several of these look
  // like "//evil.example" to it. None may take the user off this origin.
  const hostile: Record<string, string> = {
    "protocol-relative": "//evil.example/steal",
    "absolute URL": "https://evil.example/steal",
    backslash: "/\\evil.example/steal",
    "tab between slashes": "/\t/evil.example/steal",
    "newline between slashes": "/\n/evil.example/steal",
  };

  for (const [name, redirect] of Object.entries(hostile)) {
    test(`a ${name} redirect stays on this origin`, async ({ page, baseURL }) => {
      const requestedElsewhere: string[] = [];
      // Match on the host, not the URL: the hostile value also sits in this app's own query string.
      await page.route(
        (url) => url.hostname === "evil.example",
        (route) => {
          requestedElsewhere.push(route.request().url());
          return route.abort();
        },
      );

      await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
      await submitLogin(page, "staff");

      await expect(overview(page)).toBeVisible({ timeout: 15_000 });
      expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
      expect(requestedElsewhere).toEqual([]);
    });
  }
});
