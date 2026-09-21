"use client";

import { useQueryClientInstance as useSharedQueryClient } from "@nova/app-shell";

import { QUERY_STALE_TIME } from "@/config/app";

export function useQueryClientInstance() {
  return useSharedQueryClient({ staleTime: QUERY_STALE_TIME.short });
}
