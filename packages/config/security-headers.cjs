// Security response headers shared by every Next.js app (web, seller, admin).
// CommonJS on purpose: Next compiles next.config.ts to CommonJS, and require() of an ES
// module is not supported on every Node 20 release the repo allows. Being a plain file it
// also needs no build step. Apps import it as `@nova/config/security-headers.cjs`.
//
// Deliberately NOT included, and why:
//  - A full Content-Security-Policy: Next.js needs a per-request nonce strategy for its
//    inline bootstrap and theme scripts, which is a design decision of its own. Only the
//    `frame-ancestors` directive is set here — it restricts nothing but framing.
//  - Permissions-Policy and Cross-Origin-Opener-Policy: either can break features that
//    are not settled yet (camera capture for seller photos, payment pop-ups).
// The backend's own policy lives in backend/src/common/security/security-headers.ts.

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** The value of `headers()` in a next.config.ts: apply the headers to every route. */
const securityHeaderRules = [{ source: "/:path*", headers: securityHeaders }];

exports.securityHeaders = securityHeaders;
exports.securityHeaderRules = securityHeaderRules;
