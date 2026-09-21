"use client";

import type { ReactNode } from "react";

import { AuthProvider as SharedAuthProvider, useAuth } from "@nova/app-shell";
import type { Session } from "@nova/auth";

import { COOKIE_KEYS } from "@/config/app";
import { logout as clearTokens, restoreSession } from "@/services/auth.service";

export { useAuth };

// The behaviour is shared (@nova/app-shell); this app supplies its own cookie, where to go after
// signing out, and its own session service.
export function AuthProvider({
  children,
  initialSession = null,
}: {
  children: ReactNode;
  initialSession?: Session | null;
}) {
  return (
    <SharedAuthProvider
      sessionCookieKey={COOKIE_KEYS.session}
      afterLogoutPath="/login"
      restoreSession={restoreSession}
      clearTokens={clearTokens}
      initialSession={initialSession}
    >
      {children}
    </SharedAuthProvider>
  );
}
