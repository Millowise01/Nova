import { expect, test } from "@playwright/test";

/**
 * The Phase 1 smoke test: sign up → browse → add to cart → checkout → view
 * order. Runs against a real backend (Docker Postgres/Redis + `pnpm --filter
 * @nova/backend dev`) — no mocks, no fixtures beyond what's already in the
 * dev database from prior backend integration test runs (real published
 * products with in-stock variants).
 *
 * Payment method is deliberately "card", not the form's default "wallet":
 * wallet debits require a real balance a fresh signup never has
 * (PaymentsService.processPaymentForOrder), while card/mobile-money route
 * through the always-succeeding StubPaymentProvider — the only choice that
 * makes a fresh account's checkout deterministically succeed.
 */
test("customer can sign up, browse, add to cart, check out, and see a confirmed order", async ({
  page,
}) => {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const email = `e2e-${unique}@example.com`;
  const phone = `+2327${unique.replace(/\D/g, "").slice(0, 8).padEnd(8, "0")}`;

  // ── Sign up ──────────────────────────────────────────────────────────
  await page.goto("/en/auth/register");
  await page.locator('input[name="firstName"]').fill("E2E");
  await page.locator('input[name="lastName"]').fill("Shopper");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="phone"]').fill(phone);
  await page.locator('input[name="password"]').fill("password123");
  await page.locator('input[name="confirmPassword"]').fill("password123");
  await page.getByRole("button", { name: "Register" }).click();

  // Successful signup redirects to home ("/") — wait for real home content
  // rather than a specific URL, since the locale-prefix redirect is a second
  // hop (next-intl middleware normalizes "/" to "/en").
  await expect(page.getByRole("heading", { name: "Featured Products" })).toBeVisible({
    timeout: 15_000,
  });

  // ── Browse ───────────────────────────────────────────────────────────
  const firstProductLink = page.locator('a[href^="/product/"]').first();
  await expect(firstProductLink).toBeVisible();
  const productTitle = (await firstProductLink.textContent())?.trim();
  await firstProductLink.click();

  await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  if (productTitle) {
    await expect(page.getByRole("heading", { name: productTitle })).toBeVisible();
  }

  // ── Add to cart ──────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Added to cart" })).toBeVisible();

  await page.goto("/en/cart");
  await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
  await expect(page.getByText(/^Qty: \d+$/).first()).toBeVisible();

  // ── Checkout ─────────────────────────────────────────────────────────
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.locator('input[name="addressLine"]').fill("12 Wilberforce Street");
  await page.locator('input[name="city"]').fill("Freetown");
  await page.locator('input[name="district"]').fill("Freetown Central");
  await page.locator('input[name="phone"]').fill(phone);
  // Wallet is the form's default and would fail (no balance on a fresh
  // account) — card goes through the stub PSP, which always succeeds.
  await page.locator('select[name="paymentMethod"]').selectOption("card");

  // The five-step indicator (Address/Delivery/Payment/Review/Confirmation) is
  // cosmetic — every field above is already on screen regardless of step, so
  // "Continue" just advances the step counter to unlock "Place Order".
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByRole("button", { name: "Place Order" }).click();

  // ── View order ───────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]+/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /^Order #/ })).toBeVisible();
  // "confirmed" is the real success status (PaymentsService); "cancelled" is
  // what a declined payment produces — asserting the specific status, not
  // just "a badge exists", is what makes this check for a real success.
  await expect(page.getByText("confirmed", { exact: true })).toBeVisible();
});
