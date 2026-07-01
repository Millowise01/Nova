export default {
  "*.{js,mjs,cjs,ts,tsx,json,md,yml,yaml}": ["prettier --write"],
  "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix"]
};