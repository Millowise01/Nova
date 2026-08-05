import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

import { ApiError } from "../errors/api-error";
import type { RequestWithCorrelationId } from "../middleware/correlation-id.middleware";

/** Every error response follows backend/docs/02-api-standards.md's shape exactly:
 *  { error: { code, message, correlationId, details? } }. This is the ONE place that
 *  shape is produced — no controller builds its own error body. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithCorrelationId>();
    const correlationId = request.correlationId ?? "req_unknown";

    if (exception instanceof ApiError) {
      response.status(exception.getStatus()).json({
        error: {
          code: exception.code,
          message: exception.message,
          correlationId,
          ...(exception.details !== undefined ? { details: exception.details } : {}),
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === "string" ? body : ((body as { message?: string }).message ?? "Error");
      response.status(status).json({
        error: { code: `HTTP_${status}`, message, correlationId },
      });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
        correlationId,
      },
    });
  }
}
