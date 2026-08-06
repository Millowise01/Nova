import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ToastProvider } from "@/providers/toast-provider";

/** Retries/staleness off — tests should observe exactly the requests they set
 *  up, not React Query's production retry/caching behavior. gcTime is left at
 *  its default (NOT 0): a 0 gcTime garbage-collects any query with zero active
 *  observers almost immediately, which silently wipes out data seeded via
 *  setQueryData() in tests that never mount a matching useQuery — a fresh
 *  QueryClient per test already gives full isolation without needing this. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function withQueryClient(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

/** For hooks that also call useToast() (most mutations do, for error/success
 *  messages) — a real ToastProvider, not a mock, since it's cheap and pure. */
export function withQueryClientAndToast(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}
