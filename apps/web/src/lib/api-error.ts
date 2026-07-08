export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isServerError() {
    return (this.status ?? 0) >= 500;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error && typeof error === "object" && "message" in error) {
    const e = error as { message: string; status?: number; code?: string; details?: unknown };
    return new ApiError(e.message, e.status, e.code, e.details);
  }
  return new ApiError("An unexpected error occurred");
}
