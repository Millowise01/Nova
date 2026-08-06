import path from "node:path";

// Workspace packages ESLint's import/order needs to resolve path aliases (@/*,
// tsconfig `paths`) correctly for — this is exactly the set of directories
// that have their own tsconfig.json. Running `eslint --fix` from the repo
// ROOT against a file living under one of these (lint-staged's default
// behavior) resolves those aliases differently than running it from WITHIN
// the package — confirmed directly: the same file, fixed from root vs. fixed
// from apps/web, produced two different import orderings, and only the
// package-scoped one matches what `pnpm lint` (via turbo, which always cd's
// into each package) and CI actually enforce. Silently "fixing" imports into
// an order CI then rejects is worse than not fixing them, so every staged
// TS/JS file below is grouped by its owning package and eslint is invoked
// with that package as cwd.
const WORKSPACE_ROOTS = ["apps/admin", "apps/docs", "apps/seller", "apps/web", "backend"];

function findWorkspaceRoot(absoluteFilePath) {
  const relative = path.relative(process.cwd(), absoluteFilePath).replace(/\\/g, "/");
  return WORKSPACE_ROOTS.find((root) => relative === root || relative.startsWith(`${root}/`));
}

function eslintFixScopedByPackage(filenames) {
  const byPackage = new Map();

  for (const filename of filenames) {
    const workspaceRoot = findWorkspaceRoot(filename);
    const key = workspaceRoot ?? "."; // packages/* and root files: no observed discrepancy, root cwd is fine
    const relativeToPackage = path.relative(path.resolve(key), filename).replace(/\\/g, "/");
    const list = byPackage.get(key) ?? [];
    list.push(relativeToPackage);
    byPackage.set(key, list);
  }

  return [...byPackage.entries()].map(
    ([dir, files]) =>
      `pnpm --dir ${JSON.stringify(dir)} exec eslint --fix ${files.map((f) => JSON.stringify(f)).join(" ")}`,
  );
}

export default {
  // eslint --fix runs first (import ordering, other autofixable rules), then
  // prettier --write runs on its output — eslint's autofix formatting doesn't
  // always exactly match Prettier's, so Prettier has to go last to guarantee
  // the final staged content is actually Prettier-clean.
  "*.{ts,tsx,js,mjs,cjs}": [eslintFixScopedByPackage, "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  // Runs on every staged file regardless of extension so a secret can't slip
  // in via a file type the other two patterns don't cover (.env*, .sh, etc).
  // secretlint exits non-zero on a match, which fails lint-staged and blocks
  // the commit.
  "*": ["secretlint --secretlintrc .secretlintrc.json"],
};
