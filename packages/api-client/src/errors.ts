import type { AxiosError } from "axios";

/** Matches backend/docs/02-api-standards.md's error envelope exactly:
 *  { error: { code, message, correlationId, details? } }. */
export interface ApiErrorShape {
  code: string;
  message: string;
  correlationId: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly correlationId: string;
  readonly details?: ApiErrorShape["details"];
  readonly status?: number;

  constructor(shape: ApiErrorShape, status?: number) {
    super(shape.message);
    this.name = "ApiError";
    this.code = shape.code;
    this.correlationId = shape.correlationId;
    this.details = shape.details;
    this.status = status;
  }

  /** Field-level messages, if this was a VALIDATION_FAILED error — keyed by field name. */
  get fieldErrors(): Record<string, string[]> {
    return this.details?.fieldErrors ?? {};
  }
}

/** Normalizes any axios failure into an ApiError. A response that doesn't match the
 *  documented error envelope (network failure, backend down, unexpected 5xx from a
 *  proxy) still becomes an ApiError rather than leaking an axios-shaped error upward. */
export function toApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<{ error?: Partial<ApiErrorShape> }>;
  const body = axiosError.response?.data?.error;

  if (body?.code && body.message && body.correlationId) {
    return new ApiError(body as ApiErrorShape, axiosError.response?.status);
  }

  return new ApiError(
    {
      code: axiosError.response ? "UNKNOWN_ERROR" : "NETWORK_ERROR",
      message: axiosError.response
        ? "An unexpected error occurred."
        : "Could not reach the server. Check your connection.",
      correlationId: "none",
    },
    axiosError.response?.status,
  );
}
