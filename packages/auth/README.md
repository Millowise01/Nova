# Auth Package

Shared authentication contracts consumed wherever session state needs a common shape — currently the customer web app, with the seller and admin portals expected to adopt the same contract as their auth flows are built out. Public API: `sessionSchema` (a Zod schema validating `{ userId, roles, expiresAt }`) and the derived `Session` type (`z.infer<typeof sessionSchema>`). This package owns the session _shape_, not the authentication mechanism itself (token issuance, MFA, OAuth) — that lives in the backend per the Security & Compliance blueprint (Volume 3).
