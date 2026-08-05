/** Opaque cursor encode/decode — backend/docs/02-api-standards.md's proposed format:
 *  base64url JSON envelope of { sortValue, id }. Treated as opaque by clients; only
 *  this module knows the shape. */

export interface CursorPayload {
  sortValue: string;
  id: string;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload {
  const json = Buffer.from(cursor, "base64url").toString("utf8");
  const parsed: unknown = JSON.parse(json);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("sortValue" in parsed) ||
    !("id" in parsed)
  ) {
    throw new Error("Invalid cursor");
  }
  return parsed as CursorPayload;
}
