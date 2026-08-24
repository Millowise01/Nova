"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ProposeKycDecisionInput } from "@nova/validation";

import { useMutationErrorToast } from "@/lib/use-mutation-error-toast";
import { useToast } from "@/providers/toast-provider";
import { getApiClient } from "@/services/api";

export function useProposeKycDecisionMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProposeKycDecisionInput }) =>
      getApiClient().trustSafety.proposeKycDecision(id, input),
    onSuccess: () => {
      toast.success("Decision proposed — a different admin needs to confirm it.");
      void queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
    onError,
  });
}

export function useConfirmKycDecisionMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (id: string) => getApiClient().trustSafety.confirmKycDecision(id),
    onSuccess: (result) => {
      toast.success(`KYC submission ${result.status}.`);
      void queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
    onError,
  });
}

export function useProposeSuspendMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: ({ sellerId, reason }: { sellerId: string; reason: string }) =>
      getApiClient().trustSafety.proposeSuspend(sellerId, reason),
    onSuccess: () => {
      toast.success("Suspension proposed — a different admin needs to confirm it.");
      void queryClient.invalidateQueries({ queryKey: ["suspension-requests"] });
    },
    onError,
  });
}

export function useProposeReinstateMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: ({ sellerId, reason }: { sellerId: string; reason: string }) =>
      getApiClient().trustSafety.proposeReinstate(sellerId, reason),
    onSuccess: () => {
      toast.success("Reinstatement proposed — a different admin needs to confirm it.");
      void queryClient.invalidateQueries({ queryKey: ["suspension-requests"] });
    },
    onError,
  });
}

export function useConfirmSuspensionRequestMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (id: string) => getApiClient().trustSafety.confirmSuspensionRequest(id),
    onSuccess: (result) => {
      toast.success(`Seller ${result.action === "suspend" ? "suspended" : "reinstated"}.`);
      void queryClient.invalidateQueries({ queryKey: ["suspension-requests"] });
    },
    onError,
  });
}

export function useRejectSuspensionRequestMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      getApiClient().trustSafety.rejectSuspensionRequest(id, reason),
    onSuccess: () => {
      toast.success("Request rejected.");
      void queryClient.invalidateQueries({ queryKey: ["suspension-requests"] });
    },
    onError,
  });
}

export function useAddDisputeCommentMutation(disputeId: string) {
  const queryClient = useQueryClient();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (note: string) => getApiClient().trustSafety.addDisputeComment(disputeId, { note }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["disputes", disputeId] });
    },
    onError,
  });
}

export function useResolveDisputeMutation(disputeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (resolution: string) =>
      getApiClient().trustSafety.resolveDispute(disputeId, resolution),
    onSuccess: () => {
      toast.success("Dispute resolved.");
      void queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
    onError,
  });
}
