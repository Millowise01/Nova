"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useTransition } from "react";

import { type Session, sessionSchema } from "@nova/auth";

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
      document.cookie = `nova_session=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=86400; SameSite=Lax`;
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
    setSession(null);
    document.cookie = "nova_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    startTransition(() => {
      router.refresh();
      router.push("/");
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      if (match) return decodeURIComponent(match[2] ?? "");
      return null;
    };

    const rawSession = getCookie("nova_session");
    if (rawSession) {
      try {
        const parsed: unknown = JSON.parse(rawSession);
        setSession(sessionSchema.parse(parsed));
      } catch {
        document.cookie =
          "nova_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    }
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
