"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@nova/api-client";

import { useToast } from "@/providers/toast-provider";
import { addDisputeComment } from "@/services/trust-safety.service";

import { disputeKeys } from "./trust-safety.keys";

export function useAddDisputeCommentMutation(disputeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (note: string) => addDisputeComment(disputeId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't post your comment. Please try again.",
      );
    },
  });
}
