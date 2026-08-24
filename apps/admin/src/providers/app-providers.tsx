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

/** Smaller than apps/web's AppProviders — no AnalyticsProvider/DrawerProvider/
 *  ModalProvider (customer-storefront concerns apps/admin's three review-queue
 *  screens don't need; Dialog/ConfirmDialog from @nova/design-system are
 *  self-contained, no global modal-manager context required). */
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
