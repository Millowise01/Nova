import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

/**
 * Browser-level checks of the storefront's authentication and route guard: what happens to a
 * signed-out visitor and to unreadable or forged session cookies on a protected page, signing in,
 * and session restoration after a reload.
 *
 * The guard is a navigation aid, not authorization: the session cookie is written by the browser
 * and can be forged, and the backend authorizes every request from the access token.
 *
 * There is no sign-out control in this app yet, so sign-out is covered in the seller and admin
 * suites only. The purchase journey covers registration and checkout.
 */
const SESSION_COOKIE = "nova_session";
const PROTECTED_PATH = "/en/orders";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

const digits = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

/** A fresh customer, signed up through the real API (generated per run, never stored). */
async function newCustomer(request: APIRequestContext) {
  const email = `e2e-web-auth-${Date.now()}-${digits(4)}@example.com`;
  const password = `Aa1-${digits(12)}`;
  const response = await request.post(`${API_BASE_URL}/auth/signup`, {
    data: {
      firstName: "E2E",
      lastName: "Auth",
      email,
      phone: `+232${digits(10)}`,
      password,
      confirmPassword: password,
    },
  });
  expect(response.ok(), `signup failed with ${response.status()}`).toBe(true);
  return { email, password };
}

async function signIn(page: Page, account: { email: string; password: string }) {
  await page.goto("/en/auth/login");
  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="password"]').fill(account.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Featured Products" })).toBeVisible({
    timeout: 15_000,
  });
}

async function sessionCookie(page: Page) {
  return (await page.context().cookies()).find((cookie) => cookie.name === SESSION_COOKIE);
}

const loginRedirect = new RegExp(
  `/en/auth/login\\?redirect=${encodeURIComponent(PROTECTED_PATH)}$`,
);

test("a signed-out visitor is sent to the login page from a protected page", async ({ page }) => {
  await page.goto(PROTECTED_PATH);
  await expect(page).toHaveURL(loginRedirect);
});

test("a garbage session cookie counts as signed out", async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: SESSION_COOKIE, value: "garbage", url: baseURL! }]);
  await page.goto(PROTECTED_PATH);
  await expect(page).toHaveURL(loginRedirect);
});

test("a forged session cookie opens nothing: the app drops it and the API ignores it", async ({
  page,
  baseURL,
  request,
}) => {
  const forged = encodeURIComponent(
    JSON.stringify({
      userId: "00000000-0000-4000-8000-000000000000",
      roles: ["customer"],
      expiresAt: "2099-01-01T00:00:00.000Z",
    }),
  );
  await page.context().addCookies([{ name: SESSION_COOKIE, value: forged, url: baseURL! }]);

  // The middleware only reads the cookie, so it lets the navigation through. The client then finds
  // no refresh token to back the claim, drops the session, and the guard sends the visitor away.
  await page.goto(PROTECTED_PATH);
  await expect(page).not.toHaveURL(new RegExp(`${PROTECTED_PATH}$`), { timeout: 15_000 });
  await expect.poll(() => sessionCookie(page)).toBeUndefined();

  // The backend is the boundary: the same cookie authorizes nothing there.
  const response = await request.get(`${API_BASE_URL}/me`, {
    headers: { cookie: `${SESSION_COOKIE}=${forged}` },
  });
  expect(response.status()).toBe(401);
});

test("a customer can sign in, and the session is restored after a reload", async ({
  page,
  request,
}) => {
  await signIn(page, await newCustomer(request));
  expect(await sessionCookie(page)).toBeDefined();

  await page.goto(PROTECTED_PATH);
  // "No orders yet" is what an account with no orders sees once the orders request succeeded, so
  // it proves the API accepted this session, not just that the page rendered.
  await expect(page.getByText("No orders yet")).toBeVisible({ timeout: 15_000 });

  // The access token lives in memory only: a reload has to earn a new one from the stored refresh
  // token before the same request can succeed again.
  await page.reload();
  await expect(page).toHaveURL(new RegExp(`${PROTECTED_PATH}$`));
  await expect(page.getByText("No orders yet")).toBeVisible({ timeout: 15_000 });
});
