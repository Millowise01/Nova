"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateProductInput } from "@nova/validation";

import { useMutationErrorToast } from "@/lib/use-mutation-error-toast";
import { useToast } from "@/providers/toast-provider";
import { getApiClient } from "@/services/api";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const onError = useMutationErrorToast();

  return useMutation({
    mutationFn: (input: CreateProductInput) => getApiClient().catalog.createProduct(input),
    onSuccess: () => {
      toast.success("Product listed.");
      void queryClient.invalidateQueries({ queryKey: ["catalog", "my-products"] });
    },
    onError,
  });
}
