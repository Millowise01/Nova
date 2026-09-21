import { createSessionService } from "@nova/app-shell";

import { getApiClient } from "./api";

/** No seller signup flow — POST /v1/auth/signup hard-codes roles: ["customer"]
 *  (backend/src/modules/identity/domain/auth.service.ts), so there is no way to become
 *  a seller through the API: seller accounts are promoted out of band.
 *  This service only logs an already-seller user in through the same /v1/auth/login endpoint
 *  apps/web uses. The flows themselves are shared (@nova/app-shell). */
export const { login, restoreSession, logout } = createSessionService(getApiClient);
