"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useMutationErrorToast } from "@/lib/use-mutation-error-toast";
import { useToast } from "@/providers/toast-provider";
import { getApiClient } from "@/services/api";

export function useApproveRefundMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (id: string) => getApiClient().wallet.approveRefund(id),
    onSuccess: (result) => {
      toast.success(`Refund ${result.status}.`);
      void queryClient.invalidateQueries({ queryKey: ["refunds"] });
    },
    onError,
  });
}

export function useRejectRefundMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      getApiClient().wallet.rejectRefund(id, reason),
    onSuccess: () => {
      toast.success("Refund rejected.");
      void queryClient.invalidateQueries({ queryKey: ["refunds"] });
    },
    onError,
  });
}

export function useApprovePayoutMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (id: string) => getApiClient().finance.approvePayout(id),
    onSuccess: (result) => {
      toast.success(`Payout ${result.status}.`);
      void queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError,
  });
}

export function useRejectPayoutMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      getApiClient().finance.rejectPayout(id, reason),
    onSuccess: () => {
      toast.success("Payout rejected.");
      void queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError,
  });
}
