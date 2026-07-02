"use client";

import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useQueryClientInstance() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return client;
}
