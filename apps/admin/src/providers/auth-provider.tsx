"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useTransition } from "react";

import { type Session, sessionSchema } from "@nova/auth";

import { COOKIE_KEYS } from "@/config/app";
import { logout as clearTokens, restoreSession } from "@/services/auth.service";

type AuthContextType = {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (session: Session) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const login = (newSession: Session) => {
    setIsLoading(true);
    try {
      const parsed = sessionSchema.parse(newSession);
      setSession(parsed);
      document.cookie = `${COOKIE_KEYS.session}=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=86400; SameSite=Lax`;
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
    document.cookie = `${COOKIE_KEYS.session}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
      router.push("/login");
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      if (match) return decodeURIComponent(match[2] ?? "");
      return null;
    };

    const rawSession = getCookie(COOKIE_KEYS.session);
    if (rawSession) {
      try {
        setSession(sessionSchema.parse(JSON.parse(rawSession) as unknown));
      } catch {
        document.cookie = `${COOKIE_KEYS.session}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
    }

    // Same silent-refresh-on-boot pattern as apps/web/src/providers/auth-provider.tsx.
    void restoreSession().then((restored) => {
      if (restored) {
        login(restored);
      } else if (rawSession) {
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
