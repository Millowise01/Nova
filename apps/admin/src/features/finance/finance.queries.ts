"use client";

import { useQuery } from "@tanstack/react-query";

import { getApiClient } from "@/services/api";

export function useRefundsQueueQuery() {
  return useQuery({
    queryKey: ["refunds", "proposed"],
    queryFn: () => getApiClient().wallet.listRefunds({ status: "proposed" }),
  });
}

export function usePayoutsQueueQuery() {
  return useQuery({
    queryKey: ["payouts", "proposed"],
    queryFn: () => getApiClient().finance.listPayouts({ status: "proposed" }),
  });
}
