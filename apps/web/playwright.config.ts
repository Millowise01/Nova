import { defineConfig, devices } from "@playwright/test";

/** Backend origin the web app is configured to call — see NEXT_PUBLIC_API_BASE_URL
 *  in .env.local/.env.example. Not used directly by Playwright; the app itself
 *  reads it, this is just here so a misconfigured env fails loudly (see below)
 *  rather than every test timing out on network requests that go nowhere. */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Journeys create real signups/orders against a real backend — one worker
  // avoids two parallel runs racing over the same rate-limited /auth/otp,
  // /auth/signup, etc. endpoints (backend/docs/02-api-standards.md).
  workers: 1,
  reporter: process.env.CI ? [["html"], ["github"]] : "html",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Always a production server (`next start`), not `next dev` — this is the
  // staging-deploy smoke test, so it should exercise what actually ships, and
  // next dev's per-route on-demand compilation was observed to blow past
  // navigation timeouts on a cold first hit to a page. Requires `pnpm build`
  // to have already run (turbo's test:e2e task depends on build — turbo.json
  // — so this is automatic in CI; run `pnpm --filter web build` first
  // locally).
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_API_BASE_URL: API_BASE_URL },
  },
});
