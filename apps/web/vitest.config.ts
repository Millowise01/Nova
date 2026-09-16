import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // Scoped to this package's own tsconfig only — the default (project-wide)
  // discovery walks referenced projects and fails on packages/i18n's
  // tsconfig.json, which doesn't exist (planned package, not yet scaffolded).
  plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] }), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // e2e/**/*.spec.ts are Playwright specs (playwright.config.ts), not
    // Vitest's — vitest's default include glob matches *.spec.ts too, which
    // makes it try to run test() from @playwright/test under its own runner.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
