import { tokenStore } from "@nova/api-client";
import { createSessionService } from "@nova/app-shell";
import type { Session } from "@nova/auth";
import type { RegisterInput, UpdateMeInput } from "@nova/validation";

import { getApiClient } from "./api";

const sessions = createSessionService(getApiClient);

export const { login, restoreSession, logout } = sessions;

/** Real signup — stores tokens (in-memory access + localStorage refresh, see
 *  @nova/api-client/token-store) and returns the lightweight session summary
 *  for AuthProvider's cookie (apps/web/src/providers/auth-provider.tsx). */
export async function signup(input: RegisterInput): Promise<Session> {
  const auth = await getApiClient().auth.signup(input);
  tokenStore.setTokens(auth.accessToken, auth.refreshToken);
  return sessions.sessionFromAuthResponse(auth);
}

export function getMe() {
  return getApiClient().auth.getMe();
}

export function updateMe(input: UpdateMeInput) {
  return getApiClient().auth.updateMe(input);
}

/** Confirms a destination + code — doesn't log the caller in or return a session,
 *  see @nova/api-client's verifyOtp for why. */
export function verifyOtp(destination: string, code: string) {
  return getApiClient().auth.verifyOtp(destination, code);
}
