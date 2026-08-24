"use client";

import { useQuery } from "@tanstack/react-query";

import { getApiClient } from "@/services/api";

export function useKycQueueQuery() {
  return useQuery({
    queryKey: ["kyc", "pending"],
    queryFn: () => getApiClient().trustSafety.listKyc({ status: "pending" }),
  });
}

export function useSuspensionQueueQuery() {
  return useQuery({
    queryKey: ["suspension-requests", "proposed"],
    queryFn: () => getApiClient().trustSafety.listSuspensionRequests({ status: "proposed" }),
  });
}

export function useDisputesQueueQuery(status: "open" | "resolved" | "closed" = "open") {
  return useQuery({
    queryKey: ["disputes", status],
    queryFn: () => getApiClient().trustSafety.listDisputes({ status }),
  });
}

export function useDisputeDetailQuery(id: string) {
  return useQuery({
    queryKey: ["disputes", id],
    queryFn: () => getApiClient().trustSafety.getDispute(id),
    enabled: !!id,
  });
}
