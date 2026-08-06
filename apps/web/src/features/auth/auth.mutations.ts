"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@nova/api-client";
import type { LoginInput, RegisterInput } from "@nova/validation";

import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { login as loginRequest, signup as signupRequest } from "@/services/auth.service";

/** Maps the backend's { error: { code, message, details.fieldErrors } } shape onto a
 *  react-hook-form form so field-level validation errors surface next to the right
 *  input, per docs/frontend/01-data-fetching-conventions.md's error-shape convention —
 *  the generic toast covers everything else (auth failures, network errors). */
function useApiErrorHandler<T extends FieldValues>(setError: UseFormSetError<T>) {
  const { toast } = useToast();

  return (error: unknown) => {
    if (!(error instanceof ApiError)) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    const fieldErrors = Object.entries(error.fieldErrors);
    if (fieldErrors.length > 0) {
      for (const [field, messages] of fieldErrors) {
        setError(field as Path<T>, { type: "server", message: messages[0] });
      }
      return;
    }

    toast.error(error.message);
  };
}

export function useLoginMutation(setError: UseFormSetError<LoginInput>) {
  const { login: setSession } = useAuth();
  const router = useRouter();
  const handleError = useApiErrorHandler(setError);
  const [redirecting, setRedirecting] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
    onSuccess: (session) => {
      setSession(session);
      setRedirecting(true);
      router.push("/");
    },
    onError: handleError,
  });

  return { ...mutation, isRedirecting: redirecting };
}

export function useSignupMutation(setError: UseFormSetError<RegisterInput>) {
  const { login: setSession } = useAuth();
  const router = useRouter();
  const handleError = useApiErrorHandler(setError);
  const [redirecting, setRedirecting] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: RegisterInput) => signupRequest(input),
    onSuccess: (session) => {
      setSession(session);
      setRedirecting(true);
      router.push("/");
    },
    onError: handleError,
  });

  return { ...mutation, isRedirecting: redirecting };
}
