"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import type { Session } from "@nova/auth";

import { useQueryClientInstance } from "@/hooks/use-query-client";

import { AuthProvider } from "./auth-provider";
import { ThemeProvider, type Theme } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

interface AppProvidersProps extends PropsWithChildren {
  initialSession: Session | null;
  initialTheme?: Theme;
}

/** Mirrors apps/admin/src/providers/app-providers.tsx exactly — same smaller-
 *  than-apps/web shape (no AnalyticsProvider/DrawerProvider/ModalProvider). */
export function AppProviders({ children, initialSession, initialTheme }: AppProvidersProps) {
  const client = useQueryClientInstance();

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider initialTheme={initialTheme}>
        <AuthProvider initialSession={initialSession}>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
