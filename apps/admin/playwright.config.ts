import { defineConfig, devices } from "@playwright/test";

/** Backend origin the admin app is configured to call — see NEXT_PUBLIC_API_BASE_URL in
 *  .env.local/.env.example. Same reasoning as apps/seller's playwright.config.ts: present here so
 *  a misconfigured env fails loudly rather than every test timing out on dead requests. */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Real sign-ins against a real backend; one worker avoids racing over its rate-limited auth
  // endpoints, as in the other apps.
  workers: 1,
  reporter: process.env.CI ? [["html"], ["github"]] : "html",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3002",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // A production server (`next start`), as in the other apps, so this exercises what ships. Run
  // `pnpm --filter @nova/admin build` first locally.
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_API_BASE_URL: API_BASE_URL },
  },
});
