import { HttpException, HttpStatus } from "@nestjs/common";

/** Structured error carrying the machine-readable code backend/docs/02-api-standards.md
 *  requires — never throw a bare NestJS HttpException with a string message alone. */
export class ApiError extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}

export class BadRequestError extends ApiError {
  constructor(code: string, message: string, details?: unknown) {
    super(HttpStatus.BAD_REQUEST, code, message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(code: string, message: string) {
    super(HttpStatus.UNAUTHORIZED, code, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(code: string, message: string) {
    super(HttpStatus.FORBIDDEN, code, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(code: string, message: string) {
    super(HttpStatus.NOT_FOUND, code, message);
  }
}

export class ConflictError extends ApiError {
  constructor(code: string, message: string, details?: unknown) {
    super(HttpStatus.CONFLICT, code, message, details);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(code: string, message: string) {
    super(HttpStatus.TOO_MANY_REQUESTS, code, message);
  }
}
