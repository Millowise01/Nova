import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

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
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.config.ts", "*.config.mts", "*.config.cts", ".storybook/*.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },

  // 5. Non-type-checked rules for JS/MJS files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.{js,mjs,cjs}"],
  })),

  // 6. Prettier integration to prevent style conflicts
  prettierConfig,
];
