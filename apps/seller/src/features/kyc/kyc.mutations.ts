"use client";

import { useMutation } from "@tanstack/react-query";

import type { SubmitKycInput } from "@nova/validation";

import { useMutationErrorToast } from "@/lib/use-mutation-error-toast";
import { useToast } from "@/providers/toast-provider";
import { getApiClient } from "@/services/api";

/** subjectType is always "seller" here — apps/seller has no rider concept —
 *  and subjectId is always the caller's own userId, passed in by the caller.
 *  The backend enforces that subjectId matches the authenticated caller
 *  (403 KYC_SUBJECT_MUST_BE_CALLER), and this form never makes it editable. */
export function useSubmitKycMutation() {
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (input: SubmitKycInput) => getApiClient().trustSafety.submitKyc(input),
    onSuccess: () => {
      toast.success("KYC submission received — pending review.");
    },
    onError,
  });
}
