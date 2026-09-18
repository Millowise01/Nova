import { expect, test } from "@playwright/test";

/**
 * The Phase 2 smoke test: seller logs in → submits KYC → lists a product.
 * Scoped to what's actually real — S-5 (order queue) and S-6 (payouts) and
 * S-7 (disputes) are all confirmed blocked on missing backend endpoints
 * (backend/docs/10-logistics-finance-trust-safety-design.md's "Seller-portal
 * gaps" table), so there's no order/payout/dispute step here to test against.
 *
 * The account itself is created and promoted (roles + mfaEnabled) by
 * global-setup.ts before this runs — there's no self-service seller signup
 * or MFA enrollment flow, same reasoning documented there.
 */
test("seller can log in, submit KYC, and list a product", async ({ page }) => {
  const email = process.env.SELLER_E2E_EMAIL;
  const password = process.env.SELLER_E2E_PASSWORD;
  if (!email || !password) {
    throw new Error("global-setup.ts didn't set SELLER_E2E_EMAIL/PASSWORD");
  }

  // ── Log in ───────────────────────────────────────────────────────────
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 15_000 });

  // ── Submit KYC ───────────────────────────────────────────────────────
  await page.getByRole("link", { name: "Verification (KYC)" }).click();
  await expect(page).toHaveURL(/\/kyc/);

  await page.getByLabel(/document reference/i).fill(`E2E-DOC-${Date.now()}`);
  await page.getByRole("button", { name: "Submit for review" }).click();

  await expect(page.getByText(/submission received — it's pending review/i)).toBeVisible();

  // ── List a product ───────────────────────────────────────────────────
  await page.getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(/\/catalog/);

  const productTitle = `E2E Test Product ${Date.now()}`;
  await page.getByLabel(/^title$/i).fill(productTitle);
  // Real categories seeded from prior backend integration-test runs — any
  // option is fine, this just proves a real, non-empty category list loaded.
  await page.getByLabel(/category/i).selectOption({ index: 1 });
  await page.getByLabel(/price/i).fill("19.99");
  await page.getByLabel(/stock quantity/i).fill("10");
  await page.getByRole("button", { name: "List product" }).click();

  await expect(page.getByText(productTitle)).toBeVisible({ timeout: 10_000 });
});
