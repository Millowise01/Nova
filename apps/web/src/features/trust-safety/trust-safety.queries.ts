"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/config/app";
import { useAuth } from "@/providers/auth-provider";
import { getDispute, listMyDisputes } from "@/services/trust-safety.service";

import { disputeKeys } from "./trust-safety.keys";

export function useMyDisputesQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: disputeKeys.mine(),
    queryFn: () => listMyDisputes(),
    staleTime: QUERY_STALE_TIME.short,
    enabled: isAuthenticated,
  });
}

export function useDisputeDetailQuery(id: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: disputeKeys.detail(id),
    queryFn: () => getDispute(id),
    staleTime: QUERY_STALE_TIME.short,
    enabled: isAuthenticated && !!id,
  });
}
