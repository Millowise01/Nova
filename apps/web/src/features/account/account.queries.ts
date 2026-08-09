"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/config/app";
import { useAuth } from "@/providers/auth-provider";
import { getMe } from "@/services/auth.service";

import { accountKeys } from "./account.keys";

export function useMeQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: accountKeys.me(),
    queryFn: () => getMe(),
    staleTime: QUERY_STALE_TIME.medium,
    enabled: isAuthenticated,
  });
}
