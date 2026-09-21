import { type Session, sessionSchema } from "@nova/auth";

const SESSION_MAX_AGE_SECONDS = 86_400;

/**
 * Parses the value of a session cookie. Safe to call on the server and in middleware (it touches
 * no browser API). Returns null for anything that is not a valid session.
 *
 * The cookie is written by the browser, so its content is a UI hint (which screens to show, which
 * area a role may enter), never proof of identity. The backend authorizes every request itself.
 */
export function parseSessionCookieValue(raw: string | null | undefined): Session | null {
  if (!raw) return null;
  try {
    return sessionSchema.parse(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return null;
  }
}

/** The raw (still URL-encoded) value of one cookie, or null. Browser only. */
export function readCookie(name: string): string | null {
  for (const entry of document.cookie.split("; ")) {
    const separator = entry.indexOf("=");
    if (separator > 0 && entry.slice(0, separator) === name) return entry.slice(separator + 1);
  }
  return null;
}

/** Stores `session` under `key`. Throws if it is not a valid session. Browser only. */
export function writeSessionCookie(key: string, session: Session): Session {
  const parsed = sessionSchema.parse(session);
  document.cookie = `${key}=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
  return parsed;
}

export function clearSessionCookie(key: string): void {
  document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
