# Nova Security

## Reporting a vulnerability

Do not report vulnerabilities in a public issue or pull request. Contact the repository owner privately. A dedicated security contact and disclosure process have not been designated yet; when one is, it will be listed here.

## Rules for contributors

- Never commit API keys, passwords, access tokens, private certificates, production secrets or sensitive customer data. Only `.env.example` files are tracked; secretlint runs in the pre-commit hook and in CI.
- Never print or log secrets or personal data.
- Authorization is enforced on the server. Never trust client-provided prices, inventory, ownership claims, seller IDs or payment results.
- Do not weaken a security check to make a build or test pass.

## Where the security requirements are

The security requirements that exist today are written in:

- [backend/docs/05-security-baseline.md](backend/docs/05-security-baseline.md)
- [backend/docs/08-security-implementation-checklist.md](backend/docs/08-security-implementation-checklist.md)
- The security and commerce rules in [.claude/CLAUDE.md](.claude/CLAUDE.md)

The files under `docs/12-security/` are stubs (`STATUS: STUB — NOT SOURCE OF TRUTH`) and do not yet define requirements.
