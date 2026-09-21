"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";

import type { Session } from "@nova/auth";

import {
  clearSessionCookie,
  parseSessionCookieValue,
  readCookie,
  writeSessionCookie,
} from "./session-cookie";

type AuthContextType = {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (session: Session) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type AuthProviderProps = {
  children: ReactNode;
  /** The session the server rendered with (read from the cookie), if any. */
  initialSession?: Session | null;
  /** The cookie the app keeps its session summary in. Each app has its own. */
  sessionCookieKey: string;
  /** Where to go after signing out: the staff apps use their login page, the storefront its home. */
  afterLogoutPath: string;
  /** Trades the stored refresh token for a fresh session, or null if there is none. */
  restoreSession: () => Promise<Session | null>;
  /** Drops the stored API tokens. */
  clearTokens: () => void;
};

export function AuthProvider({
  children,
  initialSession = null,
  sessionCookieKey,
  afterLogoutPath,
  restoreSession,
  clearTokens,
}: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const login = (newSession: Session) => {
    setIsLoading(true);
    try {
      setSession(writeSessionCookie(sessionCookieKey, newSession));
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      console.error("Invalid session schema", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    clearTokens();
    setSession(null);
    clearSessionCookie(sessionCookieKey);
    startTransition(() => {
      router.refresh();
      router.push(afterLogoutPath);
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const rawSession = readCookie(sessionCookieKey);
    if (rawSession) {
      const parsed = parseSessionCookieValue(rawSession);
      if (parsed) setSession(parsed);
      else clearSessionCookie(sessionCookieKey);
    }

    // The access token is memory-only and never survives a reload, so silently trade the persisted
    // refresh token for a fresh one whenever a page loads, whether or not the cookie parsed. That
    // also recovers from a stale or tampered cookie as long as the refresh token is still valid.
    void restoreSession().then((restored) => {
      if (restored) {
        login(restored);
      } else if (rawSession) {
        // The cookie claimed a session the refresh token can no longer back; do not leave the UI
        // showing a signed-in state that cannot make an authenticated request.
        logout();
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading: isLoading || isPending,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
