export default {
  // eslint --fix runs first (import ordering, other autofixable rules), then
  // prettier --write runs on its output — eslint's autofix formatting doesn't
  // always exactly match Prettier's, so Prettier has to go last to guarantee
  // the final staged content is actually Prettier-clean.
  "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  // Runs on every staged file regardless of extension so a secret can't slip
  // in via a file type the other two patterns don't cover (.env*, .sh, etc).
  // secretlint exits non-zero on a match, which fails lint-staged and blocks
  // the commit.
  "*": ["secretlint --secretlintrc .secretlintrc.json"],
};
