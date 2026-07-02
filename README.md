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
