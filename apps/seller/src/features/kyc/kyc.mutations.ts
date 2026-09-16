"use client";

import { useMutation } from "@tanstack/react-query";

import type { SubmitKycInput } from "@nova/validation";

import { useMutationErrorToast } from "@/lib/use-mutation-error-toast";
import { useToast } from "@/providers/toast-provider";
import { getApiClient } from "@/services/api";

/** subjectType is always "seller" here — apps/seller has no rider concept —
 *  and subjectId is always the caller's own userId, passed in by the caller
 *  (see submitKyc's own doc comment in @nova/api-client for why this isn't
 *  left editable: the backend doesn't enforce it against the authenticated
 *  caller, so this form never gives a seller the option to submit on behalf
 *  of a different subjectId). */
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
