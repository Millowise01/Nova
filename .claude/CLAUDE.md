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
