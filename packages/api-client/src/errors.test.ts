import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { ApiError, toApiError } from "./errors";

function makeAxiosError(status: number | undefined, data?: unknown): AxiosError {
  return {
    isAxiosError: true,
    name: "AxiosError",
    message: "Request failed",
    toJSON: () => ({}),
    response:
      status === undefined
        ? undefined
        : { status, data, statusText: "", headers: {}, config: {} as never },
  };
}

describe("toApiError", () => {
  it("builds an ApiError matching the backend's documented { error: {...} } envelope", () => {
    const axiosError = makeAxiosError(422, {
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        correlationId: "corr-123",
        details: { fieldErrors: { email: ["Invalid email"] } },
      },
    });

    const apiError = toApiError(axiosError);

    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.code).toBe("VALIDATION_FAILED");
    expect(apiError.message).toBe("Validation failed");
    expect(apiError.correlationId).toBe("corr-123");
    expect(apiError.status).toBe(422);
    expect(apiError.fieldErrors).toEqual({ email: ["Invalid email"] });
  });

  it("falls back to NETWORK_ERROR when there's no response at all", () => {
    const apiError = toApiError(makeAxiosError(undefined));
    expect(apiError.code).toBe("NETWORK_ERROR");
  });

  it("falls back to UNKNOWN_ERROR when the response body doesn't match the documented envelope", () => {
    const apiError = toApiError(makeAxiosError(500, { message: "Internal Server Error" }));
    expect(apiError.code).toBe("UNKNOWN_ERROR");
    expect(apiError.status).toBe(500);
  });

  it("falls back to UNKNOWN_ERROR when the error object is missing required envelope fields", () => {
    const apiError = toApiError(makeAxiosError(400, { error: { code: "X" } })); // no message/correlationId
    expect(apiError.code).toBe("UNKNOWN_ERROR");
  });
});

describe("ApiError.fieldErrors", () => {
  it("returns {} when the error has no details at all (a generic, non-validation failure)", () => {
    const apiError = new ApiError({ code: "SOME_ERROR", message: "m", correlationId: "c" });
    expect(apiError.fieldErrors).toEqual({});
  });

  it("returns the details.fieldErrors map when present", () => {
    const apiError = new ApiError({
      code: "VALIDATION_FAILED",
      message: "m",
      correlationId: "c",
      details: { fieldErrors: { password: ["Too short"] } },
    });
    expect(apiError.fieldErrors).toEqual({ password: ["Too short"] });
  });
});
