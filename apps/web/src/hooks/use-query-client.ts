"use client";

import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { QUERY_STALE_TIME } from "@/config/app";

export function useQueryClientInstance() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME.short,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return client;
}
