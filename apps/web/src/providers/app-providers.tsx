"use client";

import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQueryClientInstance } from "@/hooks/use-query-client";

export function AppProviders({ children }: PropsWithChildren) {
  const client = useQueryClientInstance();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
