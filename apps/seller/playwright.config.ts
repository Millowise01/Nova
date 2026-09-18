import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

/** Backend origin the seller app is configured to call — see
 *  NEXT_PUBLIC_API_BASE_URL in .env.local/.env.example. Same reasoning as
 *  apps/web's playwright.config.ts: present here so a misconfigured env
 *  fails loudly rather than every test timing out on dead requests. */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: path.resolve(__dirname, "./e2e/global-setup.ts"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Same reasoning as apps/web: real signups against a real backend, one
  // worker avoids racing over rate-limited auth endpoints.
  workers: 1,
  reporter: process.env.CI ? [["html"], ["github"]] : "html",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Always a production server (`next start`), not `next dev` — same
  // real reason apps/web's config documents: next dev's per-route on-demand
  // compilation blew past navigation timeouts on a cold first hit, and this
  // is meant to exercise what actually ships. Requires `pnpm build` to have
  // already run (turbo's test:e2e task depends on build — automatic in CI;
  // run `pnpm --filter @nova/seller build` first locally).
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_API_BASE_URL: API_BASE_URL },
  },
});
