# Contributing to Nova

Setup, commands and the monorepo layout are in [README.md](README.md). The engineering rules are in [.claude/CLAUDE.md](.claude/CLAUDE.md) and apply to human contributors as well as agents.

## Before you start

- Read the relevant specification first. Authoritative sources are listed under "Documentation system" in `.claude/CLAUDE.md`. Files under `docs/` marked `STATUS: STUB — NOT SOURCE OF TRUTH` are placeholders, not rules.
- Look for an existing component, service, type or utility before writing a new one. Extend it instead of duplicating it.
- Before adding a dependency, check that nothing already in the repo provides the capability, and explain in the PR why the new one is needed.

## Before you open a pull request

Run these from the repo root and fix what they report:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm secretlint
```

`pnpm test` runs the backend integration suites against the dockerized Postgres and Redis (`docker compose up -d`). The pre-commit hook (Husky + lint-staged) runs ESLint, Prettier and secretlint on staged files.

Also:

- Add or update tests for meaningful behavior. Prefer testing business rules (ownership, authorization, inventory, payment state) over coverage numbers.
- Handle loading, empty, error and success states, keep the UI mobile-first and accessible (WCAG 2.2 AA), and follow `docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md`.
- The server is authoritative for prices, inventory, discounts, permissions, payment state and order state. Never trust these from the client.
- Update documentation when a change alters architecture, API contracts, database behavior, deployment, security behavior or developer workflow. Record architectural decisions as an ADR in `docs/19-governance/NOVA_ARCHITECTURE_DECISION_RECORDS.md`.

## Commits and pull requests

- Keep commits focused. History uses the `type(scope): summary` style (for example `fix(backend): ...`, `feat(seller): ...`, `docs(frontend): ...`).
- Do not rewrite shared history, force-push, or delete branches without agreement.
- Never commit secrets or `.env` files containing credentials; only `.env.example` files are tracked.
- Never text-merge `pnpm-lock.yaml`. Regenerate it and validate with a real `pnpm install --frozen-lockfile`.
- Fill in the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).

## Reporting a vulnerability

Do not open a public issue. See [SECURITY.md](SECURITY.md).
