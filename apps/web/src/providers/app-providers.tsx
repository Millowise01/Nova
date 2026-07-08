"use client";

import { Suspense, type PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQueryClientInstance } from "@/hooks/use-query-client";
import { ThemeProvider, type Theme } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";
import { ModalProvider } from "./modal-provider";
import { DrawerProvider } from "./drawer-provider";
import { AnalyticsProvider } from "./analytics-provider";
import type { Session } from "@nova/auth";

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

