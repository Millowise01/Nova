# Nova Documentation

Nova is a Sierra Leone-origin e-commerce marketplace supporting B2C, B2B and C2C commerce. The operating documents (`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`) are at the repository root, and the engineering rules are in `.claude/CLAUDE.md`.

## How to read this directory

The 19 numbered folders are the phased documentation architecture. **Most of the files in them are stubs.** A stub starts with a `STATUS: STUB — NOT SOURCE OF TRUTH` notice, holds no business, financial, marketplace, payment, security or architectural rules, and points to the real specification when one exists. Do not treat a stub as authoritative. A stub becomes a real document when its area is implemented or reviewed and the notice is removed in the same change.

The full map, with the authoritative sources, is [19-governance/NOVA_DOCUMENTATION_INDEX.md](19-governance/NOVA_DOCUMENTATION_INDEX.md).

## Authoritative documents today

| Area                                                         | Document                                                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| UI/UX design system (canonical)                              | [02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md](02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md)                         |
| Frontend conventions                                         | [frontend/](frontend/) (`00`–`07`)                                                                             |
| Backend design, API, database, security, payments, logistics | [../backend/docs/](../backend/docs/) (`00`–`10`)                                                               |
| Implementation audit                                         | [19-governance/NOVA_IMPLEMENTATION_AUDIT_2026-09-20.md](19-governance/NOVA_IMPLEMENTATION_AUDIT_2026-09-20.md) |
