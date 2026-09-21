"use client";

import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type QueryClientOptions = {
  /** How long fetched data counts as fresh, in milliseconds. Each app states its own. */
  staleTime: number;
};

export function createQueryClient({ staleTime }: QueryClientOptions) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** One client per mounted provider tree, stable across re-renders. */
export function useQueryClientInstance(options: QueryClientOptions) {
  const [client] = useState(() => createQueryClient(options));
  return client;
}
