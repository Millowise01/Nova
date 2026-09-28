import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@nova/api-client";

import { forgotPassword, resetPassword, signup, verifyOtp } from "@/services/auth.service";
import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSignupMutation,
  useVerifyOtpMutation,
} from "./auth.mutations";

// vi.mock() calls are hoisted above every import above by Vitest regardless
// of where they're written, so this ordering (imports first, mocks after) is
// functionally identical to interleaving them — and it's what import/order
// requires, since it treats a same-group import split by other statements as
// a violation.
const routerPushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

vi.mock("@/services/auth.service", () => ({
  signup: vi.fn(),
  verifyOtp: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(signup).mockReset();
  vi.mocked(verifyOtp).mockReset();
  vi.mocked(forgotPassword).mockReset();
  vi.mocked(resetPassword).mockReset();
  routerPushMock.mockReset();
});

// Regression/contract test for the frontend's error-shape convention (docs/
// frontend/01-data-fetching-conventions.md): a VALIDATION_FAILED ApiError's
// details.fieldErrors must map onto react-hook-form's setError per-field, and
// a non-field-level ApiError must NOT call setError at all (it's a toast).
describe("useSignupMutation error mapping", () => {
  it("maps ApiError.details.fieldErrors onto react-hook-form's setError, one call per field", async () => {
    const setError = vi.fn();
    vi.mocked(signup).mockRejectedValue(
      new ApiError({
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        correlationId: "corr-1",
        details: {
          fieldErrors: {
            email: ["Email is already registered"],
            phone: ["Invalid phone number"],
          },
        },
      }),
    );

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSignupMutation(setError), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        phone: "+23276000000",
        password: "password123",
        confirmPassword: "password123",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setError).toHaveBeenCalledWith("email", {
      type: "server",
      message: "Email is already registered",
    });
    expect(setError).toHaveBeenCalledWith("phone", {
      type: "server",
      message: "Invalid phone number",
    });
    expect(setError).toHaveBeenCalledTimes(2);
  });

  it("does NOT call setError for a non-field-level ApiError (e.g. a generic conflict)", async () => {
    const setError = vi.fn();
    vi.mocked(signup).mockRejectedValue(
      new ApiError({
        code: "EMAIL_ALREADY_EXISTS",
        message: "Account already exists",
        correlationId: "corr-2",
      }),
    );

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSignupMutation(setError), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        phone: "+23276000000",
        password: "password123",
        confirmPassword: "password123",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setError).not.toHaveBeenCalled();
  });

  it("does not call setError for a non-ApiError failure (network error) either", async () => {
    const setError = vi.fn();
    vi.mocked(signup).mockRejectedValue(new Error("network down"));

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSignupMutation(setError), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        phone: "+23276000000",
        password: "password123",
        confirmPassword: "password123",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setError).not.toHaveBeenCalled();
  });
});

// Contract test: POST /v1/auth/otp/verify doesn't issue a session (see
// packages/api-client/src/endpoints/auth.ts), so success must route to login
// rather than setting a session the way login/signup do.
describe("useVerifyOtpMutation", () => {
  it("calls verifyOtp with the given destination and code, then redirects to login on success", async () => {
    vi.mocked(verifyOtp).mockResolvedValue({ status: "verified" });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useVerifyOtpMutation("shopper@example.com"), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate("123456");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(verifyOtp).toHaveBeenCalledWith("shopper@example.com", "123456");
    expect(routerPushMock).toHaveBeenCalledWith("/auth/login");
  });

  it("does not redirect when verification fails", async () => {
    vi.mocked(verifyOtp).mockRejectedValue(
      new ApiError({
        code: "OTP_INVALID",
        message: "Invalid or expired code",
        correlationId: "corr-3",
      }),
    );

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useVerifyOtpMutation("shopper@example.com"), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate("000000");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(routerPushMock).not.toHaveBeenCalled();
  });
});

// W-10: sends the caller to the reset-password screen carrying the phone as a query
// param, the same ?destination=-style handoff useVerifyOtpMutation's page already uses.
describe("useForgotPasswordMutation", () => {
  it("requests a code for the given phone, then redirects to reset-password with it", async () => {
    vi.mocked(forgotPassword).mockResolvedValue({ status: "sent" });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useForgotPasswordMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate("+23276000000");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(forgotPassword).toHaveBeenCalledWith("+23276000000");
    expect(routerPushMock).toHaveBeenCalledWith(
      `/auth/reset-password?phone=${encodeURIComponent("+23276000000")}`,
    );
  });

  it("does not redirect when the request fails", async () => {
    vi.mocked(forgotPassword).mockRejectedValue(
      new ApiError({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
        correlationId: "c-4",
      }),
    );

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useForgotPasswordMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate("+23276000000");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(routerPushMock).not.toHaveBeenCalled();
  });
});

// W-10: POST /v1/auth/password/reset doesn't issue a session, so success must route to
// login the same way useVerifyOtpMutation does.
describe("useResetPasswordMutation", () => {
  const validInput = {
    phone: "+23276000000",
    code: "123456",
    password: "new-password-1",
    confirmPassword: "new-password-1",
  };

  it("resets the password with the form's fields, then redirects to login on success", async () => {
    vi.mocked(resetPassword).mockResolvedValue({ status: "reset" });
    const setError = vi.fn();

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useResetPasswordMutation(setError), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate(validInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(resetPassword).toHaveBeenCalledWith(
      "+23276000000",
      "123456",
      "new-password-1",
      "new-password-1",
    );
    expect(routerPushMock).toHaveBeenCalledWith("/auth/login");
  });

  it("surfaces a wrong/expired OTP as a toast, not a field error — there is no single field to blame", async () => {
    vi.mocked(resetPassword).mockRejectedValue(
      new ApiError({
        code: "OTP_INVALID_OR_EXPIRED",
        message: "Invalid or expired code",
        correlationId: "c-5",
      }),
    );
    const setError = vi.fn();

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useResetPasswordMutation(setError), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate(validInput);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setError).not.toHaveBeenCalled();
    expect(routerPushMock).not.toHaveBeenCalled();
  });

  it("maps a VALIDATION_FAILED field error onto the right input", async () => {
    vi.mocked(resetPassword).mockRejectedValue(
      new ApiError({
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        correlationId: "c-6",
        details: { fieldErrors: { code: ["Code must be 6 digits"] } },
      }),
    );
    const setError = vi.fn();

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useResetPasswordMutation(setError), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate(validInput);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(setError).toHaveBeenCalledWith("code", {
      type: "server",
      message: "Code must be 6 digits",
    });
  });
});
