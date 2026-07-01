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

## Commands

- `corepack enable`
- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm storybook`

## Notes

The legacy `frontend/` and `backend/` folders are left in place for reference, but the new workspace lives at the root and is the source of truth going forward.
