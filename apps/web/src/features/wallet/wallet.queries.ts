"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/config/app";
import { getWalletBalance } from "@/services/wallet.service";

export const walletKeys = {
  all: ["wallet"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
};

export function useWalletBalanceQuery() {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: () => getWalletBalance(),
    staleTime: QUERY_STALE_TIME.short,
  });
}
