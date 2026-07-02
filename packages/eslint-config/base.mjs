import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  {
    ignores: ["**/.next/**", "**/coverage/**", "**/dist/**", "**/storybook-static/**"],
  },
  // Type-checked rules — TS files only
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx,mts,cts}"],
  })),
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  // Non-type-checked rules for JS/MJS files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.{js,mjs,cjs}"],
  })),
  prettierConfig,
];
