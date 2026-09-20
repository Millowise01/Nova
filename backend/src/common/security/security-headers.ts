import type { INestApplication } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";

/** Nova's backend is a JSON API. Nothing it returns should ever be rendered, framed,
 *  sniffed or referred from, so the CSP forbids everything (`default-src 'none'`) and
 *  the response can't be embedded (`frame-ancestors 'none'`). Helmet's other defaults
 *  stay on: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`,
 *  `Cross-Origin-Opener/Resource-Policy`, and it removes `X-Powered-By`. */
const apiHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
  frameguard: { action: "deny" },
});

/** The Swagger UI at /docs is the one place the backend serves a page a browser renders.
 *  Its scripts are all same-origin files, so no inline script is allowed; it does need
 *  inline styles. Everything else about the policy stays strict. */
const docsHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'self'"],
    },
  },
  frameguard: { action: "deny" },
});

/** Exactly `/docs` or a path under it — not `/docs-json` or `/docsomething`. */
function isSwaggerUiPath(path: string): boolean {
  return path === "/docs" || path.startsWith("/docs/");
}

export function securityHeadersMiddleware() {
  return (req: Request, res: Response, next: NextFunction) =>
    (isSwaggerUiPath(req.path) ? docsHeaders : apiHeaders)(req, res, next);
}

/** Must be registered before any route so every response — including 401/404/error
 *  responses — carries the headers. Called from main.ts and from test-utils/create-test-app.ts
 *  so tests exercise the same policy production runs. */
export function applySecurityHeaders(app: INestApplication): void {
  app.use(securityHeadersMiddleware());
}
