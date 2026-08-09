"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MeResponse, UpdateMeInput } from "@nova/validation";

import { useToast } from "@/providers/toast-provider";
import { updateMe } from "@/services/auth.service";

import { accountKeys } from "./account.keys";

/** onMutate writes an optimistic guess, onSettled always reconciles against the
 *  real server response, onError rolls back — same pattern as
 *  features/cart/cart.mutations.ts's useAddToCartMutation. */
export function useUpdateMeMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateMeInput) => updateMe(input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.me() });
      const previousMe = queryClient.getQueryData<MeResponse>(accountKeys.me());

      if (previousMe) {
        queryClient.setQueryData<MeResponse>(accountKeys.me(), {
          ...previousMe,
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.locale !== undefined ? { locale: input.locale } : {}),
        });
      }

      return { previousMe };
    },

    onError: (_err, _input, context) => {
      if (context?.previousMe) {
        queryClient.setQueryData(accountKeys.me(), context.previousMe);
      }
      toast.error("Couldn't update your profile. Please try again.");
    },

    onSuccess: () => {
      toast.success("Profile updated");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.me() });
    },
  });
}
