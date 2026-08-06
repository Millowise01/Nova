import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@nova/api-client";

import { signup } from "@/services/auth.service";
import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

import { useSignupMutation } from "./auth.mutations";

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
}));

beforeEach(() => {
  vi.mocked(signup).mockReset();
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
