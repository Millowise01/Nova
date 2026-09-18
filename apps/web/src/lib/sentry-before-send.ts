import type { ErrorEvent, EventHint } from "@sentry/nextjs";

import { ApiError } from "@nova/api-client";

/**
 * O-2 — this app has no equivalent of the backend's per-request correlation ID
 * (backend/src/common/logging/correlation-context.ts); there is no single
 * request flowing through a Next.js render the way there is through a NestJS
 * request. But every failed backend call already surfaces as an ApiError
 * (packages/api-client/src/errors.ts) carrying the correlationId the backend
 * put on that specific response — parsed from the existing error envelope,
 * with no change to api-client or any app's business logic. Reused here,
 * mirroring backend/src/instrument.ts's own beforeSend tagging.
 */
export function sentryBeforeSend(event: ErrorEvent, hint: EventHint): ErrorEvent {
  const error = hint.originalException;
  if (error instanceof ApiError) {
    event.tags = { ...event.tags, correlationId: error.correlationId };
  }
  return event;
}
