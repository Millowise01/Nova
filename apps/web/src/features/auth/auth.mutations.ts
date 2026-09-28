"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@nova/api-client";
import type { LoginInput, RegisterInput, ResetPasswordInput } from "@nova/validation";

import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import {
  forgotPassword as forgotPasswordRequest,
  login as loginRequest,
  resetPassword as resetPasswordRequest,
  signup as signupRequest,
  verifyOtp as verifyOtpRequest,
} from "@/services/auth.service";

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

/** POST /v1/auth/otp/verify — confirms destination+code only; doesn't issue a
 *  session (see @nova/api-client's verifyOtp), so success routes to login
 *  rather than setting a session the way login/signup do. */
export function useVerifyOtpMutation(destination: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);

  const mutation = useMutation({
    mutationFn: (code: string) => verifyOtpRequest(destination, code),
    onSuccess: () => {
      toast.success("Verified. You can now log in.");
      setRedirecting(true);
      router.push("/auth/login");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Verification failed. Try again.");
    },
  });

  return { ...mutation, isRedirecting: redirecting };
}

/** POST /v1/auth/password/forgot — sends an OTP to the given phone, then hands the
 *  caller off to the reset-password screen carrying the phone as a query param, the
 *  same `?destination=`-style handoff the OTP screen already uses (see OtpForm). It
 *  always succeeds from the caller's point of view (the backend never reveals whether
 *  an account exists for that phone), so there is no field-error case here to map. */
export function useForgotPasswordMutation() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (phone: string) => forgotPasswordRequest(phone),
    onSuccess: (_data, phone) => {
      toast.success("If that phone number has an account, a reset code was sent.");
      router.push(`/auth/reset-password?phone=${encodeURIComponent(phone)}`);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Something went wrong. Try again.");
    },
  });
}

/** POST /v1/auth/password/reset — verifies the OTP and updates the password; doesn't
 *  issue a session (see @nova/api-client's resetPassword), so success routes to login
 *  the same way useVerifyOtpMutation does. A wrong/expired code and a rate limit both
 *  come back as a plain ApiError with no field target, so they surface as a toast next
 *  to the form rather than under a specific input — there's no single field to blame. */
export function useResetPasswordMutation(setError: UseFormSetError<ResetPasswordInput>) {
  const router = useRouter();
  const handleError = useApiErrorHandler(setError);
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      resetPasswordRequest(input.phone, input.code, input.password, input.confirmPassword),
    onSuccess: () => {
      toast.success("Password updated. Log in with your new password.");
      setRedirecting(true);
      router.push("/auth/login");
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
