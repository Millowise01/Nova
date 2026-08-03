"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, type PropsWithChildren } from "react";

import type { Session } from "@nova/auth";

import { AnalyticsProvider } from "./analytics-provider";
import { AuthProvider } from "./auth-provider";
import { DrawerProvider } from "./drawer-provider";
import { ModalProvider } from "./modal-provider";
import { ThemeProvider, type Theme } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

import { useQueryClientInstance } from "@/hooks/use-query-client";

interface AppProvidersProps extends PropsWithChildren {
  initialSession: Session | null;
  initialTheme?: Theme;
}

export function AppProviders({ children, initialSession, initialTheme }: AppProvidersProps) {
  const client = useQueryClientInstance();

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider initialTheme={initialTheme}>
        <AuthProvider initialSession={initialSession}>
          <ToastProvider>
            <ModalProvider>
              <DrawerProvider>
                <Suspense fallback={null}>
                  <AnalyticsProvider>{children}</AnalyticsProvider>
                </Suspense>
              </DrawerProvider>
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
