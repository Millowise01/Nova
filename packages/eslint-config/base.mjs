import path from "node:path";

import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

// This file lives at packages/eslint-config — resolve the actual monorepo root
// so allowDefaultProject patterns below are stable regardless of where ESLint
// is invoked from (a package's own "lint" script vs. lint-staged running from
// the repo root against files across many packages at once).
const repoRoot = path.resolve(import.meta.dirname, "..", "..");

export default [
  // 1. Base Recommended Configs
  js.configs.recommended,

  // 2. Global Ignores (This will stop ESLint from parsing your loose files)
  {
    ignores: [
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/next-env.d.ts",
    ],
  },

  // 3. Type-checked rules — TS files only
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx,mts,cts}"],
  })),

  // 4. TS-specific compiler and rule configurations
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: {
          // Patterns are matched relative to tsconfigRootDir (repoRoot, below).
          // typescript-eslint disallows "**" in these globs outright (a deliberate
          // guard against accidentally running "default project" mode — slow —
          // over huge swaths of files), so each location has to be listed as an
          // explicit, finite-depth pattern rather than a wildcard-at-any-depth one.
          //
          // A wildcard like "packages/*/*.config.ts" is deliberately NOT used here:
          // whether a package's root config file needs this fallback depends on
          // whether that package's own tsconfig.json already includes it, and that
          // varies per package (e.g. packages/tailwind-config/tsconfig.json already
          // includes its tailwind.config.ts directly — adding it here would conflict
          // with "found in the project service" rather than fill a real gap). Same
          // reasoning ruled out apps/*/*.config.ts: every app's tsconfig.json already
          // includes next.config.ts/tailwind.config.ts. Each entry below is listed
          // explicitly because it was verified to have no other project coverage.
          allowDefaultProject: [
            "*.config.ts",
            "*.config.mts",
            "*.config.cts",
            "packages/ui/vitest.config.ts",
            // lint-staged runs eslint from the repo root for packages/* files
            // (its per-package cwd scoping only covers apps/* and backend —
            // see lint-staged.config.mjs), which resolves the root
            // eslint.config.mjs -> this base config directly, bypassing
            // packages/ui's own eslint.config.mjs (and its tsconfig.lint.json
            // override, which already covers vitest.setup.ts for the
            // `pnpm --filter @nova/ui lint` path). Both paths need coverage.
            "packages/ui/vitest.setup.ts",
            // Same composite + rootDir:"./src" build config as packages/ui —
            // vitest.config.ts sits at the package root, outside "src/**", so
            // it has no other project coverage either.
            "packages/api-client/vitest.config.ts",
            "packages/design-system/vitest.config.ts",
            "packages/design-system/vitest.setup.ts",
            "packages/*/.storybook/*.ts",
            "packages/*/.storybook/*.tsx",
          ],
        },
        tsconfigRootDir: repoRoot,
      },
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      // Enforce a consistent import ordering: builtins/external first, then
      // @nova/* workspace packages, then relative imports, each group blank-line separated.
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "@nova/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      // A relative import that reaches into another workspace package (e.g.
      // "../../other-package/src/x") must go through its public @nova/* entrypoint instead.
      "import/no-relative-packages": "error",
    },
  },

  // 5. Non-type-checked rules for JS/MJS files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.{js,mjs,cjs}"],
  })),

  // 6. Test files — an HTTP test client (e.g. Supertest's response.body) is inherently
  // `any`-typed; asserting on response.body.data.whatever in a test is completely
  // standard practice, not an unsafe-type-flow bug the way the same pattern would be in
  // application code. Relaxing no-unsafe-* here (and only here) keeps those rules
  // meaningful everywhere else instead of the alternative — sprinkling `as` casts or
  // eslint-disable comments through every test file just to satisfy a rule that isn't
  // actually protecting against anything in this context.
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },

  // 7. Prettier integration to prevent style conflicts
  prettierConfig,
];
