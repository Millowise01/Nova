# Nova Platform

Nova is now structured as an enterprise Turborepo monorepo. This pass establishes the platform foundation only: workspace management, shared packages, app shells, and developer tooling.

## Workspace Layout

```text
apps/
  web/        Customer storefront shell
  seller/     Seller portal shell
  admin/      Admin portal shell
  docs/       Platform documentation shell
packages/
  ui/              Shared UI primitives and Storybook
  design-system/    Shared tokens, fonts, and themes
  auth/             Shared auth contracts and helpers
  api-client/       API client foundation
  validation/       Zod schemas and form contracts
  hooks/            Shared React hooks
  types/            Shared domain types
  utils/            Pure utilities
  config/           Environment and runtime config
  constants/        App-wide constants
  icons/            Shared icon registry
  analytics/        Analytics contracts
  notifications/    Notifications contracts
  permissions/      Permission model
  feature-flags/    Feature flag contracts
  storage/          Typed storage adapters
  i18n/             Locale and message primitives
  eslint-config/    Shared ESLint presets
  tailwind-config/   Shared Tailwind preset
  tsconfig/         Shared TypeScript base configs
```

## Adding a New Package

1. Create a new directory: `packages/<name>` for a shared library, or `apps/<name>` for a deployable product.
2. Add a `package.json`. Match an existing minimal package (e.g. `packages/types/package.json`) for the shape:

   ```json
   {
     "name": "@nova/<name>",
     "private": true,
     "version": "0.0.0",
     "type": "module",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "scripts": {
       "build": "tsc -p tsconfig.json",
       "typecheck": "tsc --noEmit",
       "lint": "eslint ."
     }
   }
   ```

3. Add a `tsconfig.json` that extends the shared base and turns on `composite: true` (copy `packages/types/tsconfig.json` as a template).
4. If the new package imports another `@nova/*` package, two things are required or TypeScript's project references will fail to resolve it:
   - Add it under `"dependencies"` as `"@nova/<other>": "workspace:*"` in `package.json`.
   - Add a matching `{ "path": "../<other>" }` entry to this package's `tsconfig.json` `"references"` array.
5. Add a path alias to the `paths` map in [tsconfig.base.json](tsconfig.base.json) so other packages can import it as `@nova/<name>`.
6. Add a `{ "path": "packages/<name>/tsconfig.json" }` entry to the root [tsconfig.json](tsconfig.json) `"references"` array so it's included in the root type-check graph.
7. Add a one-paragraph `README.md` describing what the package owns and its public API (see `packages/validation/README.md` for the expected format and length).
8. Run `pnpm install` to link the new workspace package, then `pnpm typecheck` and `pnpm lint` from the repo root to confirm it's wired up correctly.

No publish step is ever required — every `@nova/*` package is consumed directly from source via pnpm's `workspace:*` protocol (see "How the Task Graph Works" below for how builds stay ordered correctly as packages depend on each other).

## Commands

- `corepack enable`
- `pnpm install`
- Copy the environment files (see [.env.example](.env.example) and [apps/web/.env.example](apps/web/.env.example) for what each variable does):

  ```sh
  cp .env.example .env
  cp apps/web/.env.example apps/web/.env
  ```

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm format` — reformat the repo with Prettier
- `pnpm format:check` — check formatting without writing (what CI runs)
- `pnpm typecheck`
- `pnpm test`
- `pnpm storybook`

## How the Task Graph Works

This repo uses [Turborepo](https://turborepo.com) to run scripts (`build`, `lint`, `typecheck`, `test`) across every `apps/*` and `packages/*` at once, in the right order, without rebuilding things that haven't changed. If you've never used it, here's what's actually happening:

**The task graph.** [turbo.json](turbo.json) declares, per task, what has to run first. The key line is `"dependsOn": ["^build"]` — the `^` means "the `build` task of every package this package depends on." So running `pnpm build` builds `@nova/design-system` before `@nova/ui` before `apps/web`, because that's the real dependency order declared in each package's `package.json`. You never write that ordering by hand, and it stays correct automatically as packages are added or their dependencies change.

**Caching.** Each task run is hashed from its inputs — source files, `package.json`, lockfile entries, upstream task outputs. If nothing relevant changed since the last run, Turborepo skips re-running it and replays the previous result instantly. That's what `Cached: X/Y` in the terminal output means — it's why a second `pnpm build` after touching one file finishes in seconds, not minutes. Locally this cache lives in `.turbo/`. In CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) it's persisted between runs via `actions/cache`, so a PR that touches one package doesn't pay to rebuild all 24.

**Filtering to what changed.** CI doesn't run every task against every package on every push — it uses `--filter=...[HEAD^1]`, meaning "only packages that changed since the previous commit, plus everything that depends on them." A change to a leaf package with no dependents (e.g. `packages/icons`) only triggers that one package; a change to something widely depended-on (e.g. `packages/types`) correctly cascades to everything downstream. You can reproduce this locally: `pnpm exec turbo run build --filter=...[HEAD^1]`.

## Notes

The legacy `backend/` folder is left in place as a placeholder for the API server work that follows the storefront pass. The new workspace lives at the root and is the source of truth going forward.

## Next Phase: Public Storefront

Build the public storefront in this order so each layer can reuse the foundations below it:

1. App shell: layouts, routing, providers
2. Landing page and homepage
3. Authentication flows
4. Product catalog and categories
5. Product details
6. Search and filtering
7. Shopping cart
8. Checkout
9. Customer account
10. Orders and order tracking
11. Wallet and rewards
12. AI shopping assistant
13. Sustainability dashboard
14. Customer support and messaging
