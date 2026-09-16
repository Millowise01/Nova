"use client";

import { ApiError } from "@nova/api-client";

import { useToast } from "@/providers/toast-provider";

/** Every seller mutation in this app just needs a toast on failure — none of them
 *  are backed by a react-hook-form (unlike login), so there's no field-level error
 *  target the way apps/web's useApiErrorHandler has. Identical to apps/admin's. */
export function useMutationErrorToast() {
  const { toast } = useToast();
  return (error: unknown) => {
    toast.error(
      error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
    );
  };
}
