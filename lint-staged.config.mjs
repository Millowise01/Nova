export default {
  // eslint --fix runs first (import ordering, other autofixable rules), then
  // prettier --write runs on its output — eslint's autofix formatting doesn't
  // always exactly match Prettier's, so Prettier has to go last to guarantee
  // the final staged content is actually Prettier-clean.
  "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
