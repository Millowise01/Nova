import { getApiClient } from "./api";

/** Trust & Safety's dispute endpoints back apps/web's Dispute Center (W-12): a caller's
 *  own disputes, one dispute's detail+timeline, and commenting — the same "read/comment
 *  on disputes you opened" ability every authenticated user already has
 *  (backend/src/common/policy/ability.factory.ts). Resolving a dispute is admin-only and
 *  has no web-facing wrapper here on purpose. */
export function listMyDisputes() {
  return getApiClient().trustSafety.listMyDisputes();
}

export function getDispute(id: string) {
  return getApiClient().trustSafety.getDispute(id);
}

export function addDisputeComment(id: string, note: string) {
  return getApiClient().trustSafety.addDisputeComment(id, { note });
}
