# Nova Workspace Package Status

**Recorded:** 2026-09-21, Phase 5. **Nothing here authorizes deleting a package.** A package is removed only when architectural evidence establishes it should be; none has been.

## Classification

| Label       | Meaning                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| ACTIVE      | Imported by application or package code today.                                                                     |
| PLANNED     | Not yet used, and a repository document plans for it (the document is cited).                                      |
| PLACEHOLDER | Present with a stated purpose, but nothing imports it and no document plans for it. Kept until a decision is made. |
| DEPRECATED  | Superseded; consumers should migrate. None currently.                                                              |
| REMOVE      | Evidence establishes it should be deleted. None currently.                                                         |

Evidence is a count of source files that import the package (tests and stories excluded) and which manifests declare it as a dependency, measured on 2026-09-21. A `[V]` in the notes means verified in that measurement.

## Packages

| Package                                 | LOC    | Importing files (apps + backend / other packages) | Status      | Notes                                                                                                                                                                        |
| --------------------------------------- | ------ | ------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nova/ui`                              | 1,657  | 59 / 0                                            | ACTIVE      | The application-facing component API (decision of 2026-09-21). Re-exports every `@nova/design-system` component and adds commerce, dashboard, layout and utility components. |
| `@nova/design-system`                   | 5,718  | 13 / 14                                           | ACTIVE      | Tokens, themes and primitive components. Consumed by `@nova/ui`; some app code still imports it directly (see the Phase 5 plan, item D).                                     |
| `@nova/validation`                      | 802    | 56 / 10                                           | ACTIVE      | Zod schemas shared by frontend and backend. One file.                                                                                                                        |
| `@nova/api-client`                      | 804    | 23 / 0                                            | ACTIVE      |                                                                                                                                                                              |
| `@nova/utils`                           | 24     | 10 / 54                                           | ACTIVE      |                                                                                                                                                                              |
| `@nova/icons`                           | 195    | 10 / 0                                            | ACTIVE      | Also used by `@nova/design-system`.                                                                                                                                          |
| `@nova/auth`                            | 9      | 15 / 0                                            | ACTIVE      | Session schema and type only; the providers and login flows live in each app (Phase 5, item C).                                                                              |
| `@nova/types`                           | 20     | 2 / 1                                             | ACTIVE      |                                                                                                                                                                              |
| `@nova/config`                          | 40     | 3 / 0                                             | ACTIVE      | Also holds `security-headers.cjs`, imported by the three apps' `next.config.ts`.                                                                                             |
| `@nova/analytics`                       | 8      | 1 / 0                                             | ACTIVE      | Tiny; declared by `web`, used by one file.                                                                                                                                   |
| `@nova/constants`                       | 2      | 1 / 0                                             | ACTIVE      | Tiny; declared by `web`, used by one file.                                                                                                                                   |
| `@nova/tailwind-config`                 | config | 0 / 0 (used through Tailwind config files)        | ACTIVE      | Declared by four apps (`admin`, `docs`, `seller`, `web`).                                                                                                                    |
| `@nova/tsconfig`, `@nova/eslint-config` | config | tooling                                           | ACTIVE      | Shared build and lint configuration.                                                                                                                                         |
| `@nova/feature-flags`                   | 7      | 0 / 0                                             | PLACEHOLDER | Declared by `web`, imported by nothing. No document plans for it.                                                                                                            |
| `@nova/hooks`                           | 14     | 0 / 0                                             | PLACEHOLDER | Declared by no manifest. No document plans for it.                                                                                                                           |
| `@nova/notifications`                   | 5      | 0 / 0                                             | PLACEHOLDER | Declared by no manifest. No document plans for it.                                                                                                                           |
| `@nova/permissions`                     | 5      | 0 / 0                                             | PLACEHOLDER | Declared by no manifest. Sits beside the backend's CASL policy engine; if it is ever used, it must not become a second source of authorization truth.                        |
| `@nova/storage`                         | 5      | 0 / 0                                             | PLACEHOLDER | Declared by no manifest. No document plans for it.                                                                                                                           |

No package is classified PLANNED: the only repository text that mentions the placeholder packages is the root `README.md` package list. A package moves to PLANNED when a document that plans for it is cited here.

## Applications

| Application   | Status      | Notes                                                                     |
| ------------- | ----------- | ------------------------------------------------------------------------- |
| `apps/web`    | ACTIVE      | Customer storefront.                                                      |
| `apps/seller` | ACTIVE      | KYC, catalog listing, analytics.                                          |
| `apps/admin`  | ACTIVE      | Seller, dispute and finance review queues.                                |
| `apps/docs`   | PLACEHOLDER | Two files; renders "Docs". Deliberately not part of Phase 5 effort. Kept. |
| `backend`     | ACTIVE      | NestJS API.                                                               |

## Maintaining this document

Update it when a package gains or loses its first importer, when a document starts planning for a placeholder, or when a decision to deprecate or remove is made. A REMOVE entry needs the evidence and the decision recorded here first.
