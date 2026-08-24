"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@nova/api-client";
import type { LoginInput } from "@nova/validation";

import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { login as loginRequest } from "@/services/auth.service";

/** Same error-mapping convention as apps/web/src/features/auth/auth.mutations.ts. */
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

/** Only a same-origin, root-relative path is honored — "/disputes/abc123" but
 *  not "//evil.com" or "https://evil.com" — since `redirect` comes from a URL
 *  query param an attacker can craft the login link with. */
function sanitizeRedirect(redirect: string | null): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) return "/";
  return redirect;
}

/** No client-side admin-role check here — a non-admin who logs in successfully
 *  gets a real session and is redirected like anyone else; middleware.ts
 *  catches the very next request and bounces them to /forbidden. Duplicating
 *  that check here would just be the exact ad hoc permission check this
 *  codebase's own conventions (backend/docs/02) warn against, client-side. */
export function useLoginMutation(setError: UseFormSetError<LoginInput>) {
  const { login: setSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleError = useApiErrorHandler(setError);
  const [redirecting, setRedirecting] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
    onSuccess: (session) => {
      setSession(session);
      setRedirecting(true);
      router.push(sanitizeRedirect(searchParams.get("redirect")));
    },
    onError: handleError,
  });

  return { ...mutation, isRedirecting: redirecting };
}
