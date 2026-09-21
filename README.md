# Nova Platform

Nova is a Sierra Leone-origin e-commerce marketplace (B2C, B2B, C2C), built as a Turborepo monorepo with a NestJS + Prisma API.

## Documentation

Documentation lives in [docs/](docs/README.md). The engineering rules for humans and agents are in [.claude/CLAUDE.md](.claude/CLAUDE.md); see also [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [AGENTS.md](AGENTS.md) and [CHANGELOG.md](CHANGELOG.md).

Most files in the 19 phase folders under `docs/` are stubs marked `STATUS: STUB — NOT SOURCE OF TRUTH`. The authoritative documents today are the [UI/UX design system](docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md), [docs/frontend/](docs/frontend/) and [backend/docs/](backend/docs/). The map is [docs/19-governance/NOVA_DOCUMENTATION_INDEX.md](docs/19-governance/NOVA_DOCUMENTATION_INDEX.md).

## Workspace Layout

```text
apps/
  web/        Customer storefront
  seller/     Seller portal (KYC, catalog, analytics)
  admin/      Admin portal (seller, dispute and finance review queues)
  docs/       Documentation app (placeholder)
backend/      NestJS + Prisma API — Identity, Catalog, Cart & Checkout, Orders, Payments & Wallet, Logistics, Finance, Trust & Safety, Wishlist, Notifications
packages/
  ui/              Shared UI primitives and Storybook
  design-system/    Shared tokens, fonts, and themes
  auth/             Shared auth contracts and helpers
  api-client/       API client foundation
  app-shell/        Shared app providers (theme, toast, query client), parameterized per app
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
- Copy the environment files (see [.env.example](.env.example) and [apps/web/.env.example](apps/web/.env.example) for what each variable does). Recommended, not currently required — nothing on the `pnpm dev` boot path reads them yet, but that'll change once real API calls are wired up:

  ```sh
  cp .env.example .env
  cp apps/web/.env.example apps/web/.env
  ```

- `pnpm dev` — runs `web`, `seller`, `admin`, and `docs` together:

  | App                         | URL                     |
  | --------------------------- | ----------------------- |
  | `web` (customer storefront) | <http://localhost:3000> |
  | `seller` (seller portal)    | <http://localhost:3001> |
  | `admin` (admin portal)      | <http://localhost:3002> |
  | `docs`                      | <http://localhost:3003> |

  To run just one, filter to its package: `pnpm --filter @nova/web dev` (swap in `@nova/seller`, `@nova/admin`, or `@nova/docs`).

- `pnpm build`
- `pnpm lint`
- `pnpm format` — reformat the repo with Prettier
- `pnpm format:check` — check formatting without writing (what CI runs)
- `pnpm typecheck`
- `pnpm test`
- `pnpm storybook` — currently broken: an unresolved `@storybook/nextjs` + Next.js 15 internal webpack-vendoring incompatibility crashes both `storybook dev` and `storybook build`. Not fixable by reconfiguring this repo — needs either a Next.js downgrade or an upstream Storybook fix.

## How the Task Graph Works

This repo uses [Turborepo](https://turborepo.com) to run scripts (`build`, `lint`, `typecheck`, `test`) across every `apps/*` and `packages/*` at once, in the right order, without rebuilding things that haven't changed. If you've never used it, here's what's actually happening:

**The task graph.** [turbo.json](turbo.json) declares, per task, what has to run first. The key line is `"dependsOn": ["^build"]` — the `^` means "the `build` task of every package this package depends on." So running `pnpm build` builds `@nova/design-system` before `@nova/ui` before `apps/web`, because that's the real dependency order declared in each package's `package.json`. You never write that ordering by hand, and it stays correct automatically as packages are added or their dependencies change.

**Caching.** Each task run is hashed from its inputs — source files, `package.json`, lockfile entries, upstream task outputs. If nothing relevant changed since the last run, Turborepo skips re-running it and replays the previous result instantly. That's what `Cached: X/Y` in the terminal output means — it's why a second `pnpm build` after touching one file finishes in seconds, not minutes. Locally this cache lives in `.turbo/`. In CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) it's persisted between runs via `actions/cache`, so a PR that touches one package doesn't pay to rebuild all 24.

**Filtering to what changed.** CI does not run every task against every package on every change. `.github/scripts/select-scope.sh` decides what lint, typecheck, test and build cover and says so in the job summary: everything when the base commit is unavailable or CI or workspace configuration changed (`all`), only the packages affected since the base, plus their dependents (`filtered`), or nothing, stated explicitly, when no package is affected (`none`). A change to a leaf package with no dependents (e.g. `packages/icons`) triggers only that package; one to something widely depended on (e.g. `packages/types`) cascades. Reproduce the filter locally with `pnpm exec turbo run build --filter=...[<base-commit>]`.

## Backend

`backend/` is a real NestJS + Prisma + PostgreSQL API — covering ten bounded contexts (Identity, Catalog, Cart & Checkout, Orders, Payments & Wallet, Logistics, Finance, Trust & Safety, Wishlist, Notifications; see [backend/docs/00-bounded-contexts.md](backend/docs/00-bounded-contexts.md) for the build order and what's still deferred). The payment provider is still a stub. It's a separate pnpm workspace member (`backend`, not under `apps/` — see [pnpm-workspace.yaml](pnpm-workspace.yaml)) with its own CommonJS `tsconfig.json`, since NestJS's decorator/DI model isn't compatible with the rest of the repo's ESM/bundler TypeScript config.

- `docker compose up -d` — starts local Postgres (port **5433**, not 5432 — see the comment in [docker-compose.yml](docker-compose.yml) about a native Postgres install already using the default port on some machines) and Redis.
- `cp backend/.env.example backend/.env`, fill in the secrets (`PII_ENCRYPTION_KEY`, `JWT_ACCESS_PRIVATE_KEY`/`JWT_ACCESS_PUBLIC_KEY` — generation commands are in the file's comments).
- `pnpm --filter @nova/backend prisma:generate` then `pnpm --filter @nova/backend prisma:migrate` — applies the schema to your local database.
- `pnpm --filter @nova/backend dev` — runs the API on <http://localhost:4000/v1>, with live Swagger/OpenAPI docs at `/docs` and the spec written to `backend/openapi.json` on every boot.
- The compiled API (`node backend/dist/main.js`, what CI and any deployment run) needs its workspace packages built first: `pnpm --filter "@nova/backend..." build`. Node 20 cannot load TypeScript, so `@nova/validation` ships a compiled CommonJS copy for the backend (ADR-0004). `pnpm --filter @nova/backend dev` builds it for you.
- `pnpm --filter @nova/backend test` — the module test suites (unit + integration against the real dockerized Postgres, not mocks).

Every request body is validated against a schema from `@nova/validation` — the same package the frontend forms use — never a locally redefined one; see `packages/validation/src/index.ts`.

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
