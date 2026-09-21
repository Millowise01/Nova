import { createRoleGuard } from "@nova/app-shell/middleware";

import { COOKIE_KEYS, SELLER_ROLE } from "@/config/app";

/** Lives at src/middleware.ts, NOT at the project root: Next.js's dev-mode middleware discovery
 *  looks in path.join(appDir, '..'), and appDir is src/app here, so a root-level middleware.ts is
 *  silently never discovered (found and confirmed live while building apps/admin).
 *
 *  The guard itself is shared (@nova/app-shell/middleware); this file supplies the role and
 *  cookie, and the matcher, which Next.js requires to be a literal in this file. Every route
 *  needs a session with the role, except /login and /forbidden. */
export const middleware = createRoleGuard({
  sessionCookieKey: COOKIE_KEYS.session,
  requiredRole: SELLER_ROLE,
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
