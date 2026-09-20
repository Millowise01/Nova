# Nova Engineering Operating System

## Mission

Nova is a Sierra Leone-focused e-commerce platform. The engineering system must support reliable commerce, mobile-first experiences, secure payments, scalable services, seller/admin operations, and future expansion.

## Core engineering principles

1. Inspect before changing.
2. Preserve working behavior.
3. Prefer existing patterns and dependencies.
4. Keep changes small and reviewable.
5. Server-side systems remain authoritative for business-critical state.
6. Security is part of implementation, not a final review.
7. Critical commerce flows require validation.
8. Do not invent files, APIs, dependencies, infrastructure, or business rules.
9. Do not expose secrets.
10. Document major architectural decisions.

## Repository rule

The repository is the source of truth.

Before implementing:
- inspect package manifests
- inspect workspace configuration
- inspect existing applications
- inspect shared packages
- inspect environment examples
- inspect existing tests
- inspect existing design-system components
- inspect API/database conventions

Do not assume an earlier technology stack is still current.

## Agent team

### Architecture
- software-architect
- technical-product-engineer

### Application
- frontend-engineer
- backend-engineer
- fullstack-engineer
- mobile-engineer
- ui-ux-engineer
- api-engineer
- database-engineer

### Commerce
- payment-engineer
- search-engineer

### Data and intelligence
- data-engineer
- analytics-engineer
- ai-ml-engineer

### Infrastructure
- devops-engineer
- cloud-engineer
- platform-engineer
- sre-engineer

### Quality and security
- qa-engineer
- cybersecurity-engineer

## Agent selection

Use the smallest group of specialists needed.

Feature implementation:
Technical Product Engineer → Software Architect when needed → relevant implementation agents → QA.

Checkout:
Technical Product Engineer → Architect → UI/UX → Frontend → API → Backend → Database → Payment → Security → QA.

Search:
Technical Product Engineer → Architect → Search → Backend/API → Database → Frontend → QA.

Deployment:
DevOps → Cloud/Platform → SRE → Security → QA.

AI:
Technical Product Engineer → Architect → Data → AI/ML → Backend/API → Frontend → Analytics → QA.

## Handoff protocol

Every agent handing work to another agent should provide:
- What was inspected
- What changed
- What remains
- Files affected
- Contracts changed
- Risks
- Validation performed
- Follow-up required

## Git rules

- Do not reset, rebase, force-push, or delete branches unless explicitly requested.
- Do not discard unrelated user changes.
- Keep commits focused.
- Do not commit secrets.
- Inspect git status before major changes.
- Explain destructive operations before performing them.

## Security rules

Never:
- expose secrets
- print environment secrets
- commit .env files containing credentials
- trust client prices
- trust client inventory
- trust frontend payment success
- bypass authorization
- weaken security checks to make a build pass

## Commerce rules

The server is authoritative for:
- prices
- inventory
- discounts
- permissions
- payment state
- order state

Critical operations should account for retries, concurrency, partial failure, and idempotency.

## Quality gates

Before declaring a feature complete:
- build passes where applicable
- relevant tests pass
- lint/type checks pass where applicable
- critical user journey is validated
- security implications reviewed
- API/database changes are consistent
- loading/error/empty states are handled
- no unrelated regressions are introduced

## Dependency rules

Before installing a package:
1. Check whether an existing dependency already provides the capability.
2. Check compatibility with the repository.
3. Consider maintenance and security.
4. Explain why the new dependency is necessary.

## Design rules

Use the existing Nova design system and brand direction. Do not introduce arbitrary visual patterns. Keep interfaces mobile-first and accessible.

The system comes first, the component comes from the system, the feature uses the component, and the page composes the feature. Never design screen by screen. The rulebook is `docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md`; read it before changing UI.

## Documentation system

The `docs/` directory has 19 phase folders. **Most of their files are stubs.** Every stub starts with a `STATUS: STUB — NOT SOURCE OF TRUTH` notice. A stub is never authoritative: do not derive business, financial, marketplace, payment, security or architectural rules from one. A stub becomes authoritative only when its notice is removed because the area was implemented or reviewed and the document populated.

Authoritative sources today:
- UI/UX: `docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md` (canonical), `docs/frontend/00`–`07`
- Backend design, API standards, DB conventions, security baseline, payments/logistics/finance design: `backend/docs/00`–`10`
- Data model: `backend/prisma/schema.prisma`; API contract: `backend/openapi.json` (generated) and `backend/docs/02-api-standards.md`
- The Nova Enterprise Blueprint (7 `.docx` volumes) is kept outside the repository; cite the Volume/Part when a rule comes from it.

If the rule you need is only in a stub or in nothing, it is undecided: ask, do not invent it.

Reading order before a major feature: product/business (01) → UI/UX (02) → architecture (03) → the real specs above → the domain phase for the area (07 marketplace, 08 seller, 09 logistics, 10 payments, 11 admin) → security (12) → quality (14). Where a phase folder holds only a stub, its notice points at the real spec.

Workflow: inspect → plan → implement → test → review → update documentation. Architectural changes need an ADR in `docs/19-governance/NOVA_ARCHITECTURE_DECISION_RECORDS.md`. Keep business logic (pricing, payment, order, inventory, seller, delivery, commission, refund, negotiation) out of presentational components: UI → feature logic → domain/service logic → API → database.

The documentation index is `docs/19-governance/NOVA_DOCUMENTATION_INDEX.md`. Other operating documents live at the repo root (`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`); this file is the single authoritative CLAUDE.md.

## Documentation

Update documentation when a change alters:
- architecture
- API contracts
- database behavior
- deployment
- security behavior
- developer workflow

## Definition of done

A task is done only when the requested behavior works, affected integrations are consistent, relevant validation has been performed, and the change does not knowingly introduce an unresolved critical issue.
