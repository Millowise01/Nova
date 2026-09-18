import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] }), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // e2e/**/*.spec.ts are Playwright specs, not Vitest's — same fix as
    // apps/web's vitest.config.ts (Vitest's default include glob matches
    // *.spec.ts too, which makes it try to run test() under its own runner).
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
