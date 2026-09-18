import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Makes the current request's correlation ID (set by CorrelationIdMiddleware)
 * readable from anywhere in that request's call graph — controller, service,
 * a downstream call several `await`s deep — without threading it through every
 * function signature. This is what makes Pino's `mixin` (logging.module.ts)
 * able to stamp EVERY log line with `correlationId`, including lines from
 * existing ad-hoc `new Logger(ClassName)` instances in backend/src/modules/*
 * that were never touched for this — those call sites all ultimately write
 * through the same underlying Pino instance once main.ts's app.useLogger()
 * is wired, and `mixin` runs for every write regardless of which Logger
 * facade produced it.
 */
export const correlationIdStorage = new AsyncLocalStorage<string>();

export function getCurrentCorrelationId(): string | undefined {
  return correlationIdStorage.getStore();
}
