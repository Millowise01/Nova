const PLACEHOLDER_ORIGIN = "https://app.invalid";

// A URL parser strips tabs and newlines and reads a backslash as a slash, so none of these may
// appear: "/\evil.com" and "/<tab>/evil.com" both start with "/" but resolve to another origin.
function hasUnsafeCharacter(value: string) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f || value[i] === "\\") return true;
  }
  return false;
}

/**
 * Returns `redirect` only when it is a path on the same origin ("/orders", "/orders?tab=open"),
 * otherwise `fallback`. `redirect` comes from a query parameter, which an attacker can put in a
 * login link, so anything that could send the user to another site is refused.
 */
export function sanitizeRedirect(redirect: string | null | undefined, fallback = "/"): string {
  if (!redirect) return fallback;
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return fallback;
  if (hasUnsafeCharacter(redirect)) return fallback;

  // Belt and braces: whatever the checks above missed, a browser must still resolve it to us.
  try {
    if (new URL(redirect, PLACEHOLDER_ORIGIN).origin !== PLACEHOLDER_ORIGIN) return fallback;
  } catch {
    return fallback;
  }
  return redirect;
}
