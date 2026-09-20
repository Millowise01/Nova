---
name: api-development
description: REST/GraphQL API design - contracts, versioning, validation, error handling. Load for building or changing an API surface.
---

# API Development

## When to use this skill

- Designing, implementing, or changing a REST or GraphQL API.

## Checklist / best practices

- Follow the existing API's conventions (naming, pagination, error shape) rather than inventing new ones.
- Validate all input at the boundary; never trust client data.
- Return consistent, structured error responses with actionable messages.
- Version breaking changes explicitly rather than mutating an existing contract.
- Paginate any endpoint that can return an unbounded list.
- Document the contract (OpenAPI/GraphQL schema) alongside the implementation.
- Rate-limit or otherwise protect endpoints that are expensive or abusable.

## Common pitfalls

- Silently changing a response shape that existing clients depend on.
- Leaking internal error details (stack traces, DB errors) to API consumers.
- Missing authorization checks on individual resources (IDOR).
- Inconsistent naming/casing between endpoints.

## Standards & references

- RESTful resource conventions or the project's existing GraphQL schema conventions.
- HTTP status codes used correctly and consistently.
