import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { map, Observable } from "rxjs";

/**
 * Every Money amount in this schema is `numeric(14,2)` (backend/docs/03), which Prisma
 * represents as a Decimal.js instance. Decimal.js's default `toString()`/`toJSON()`
 * strips trailing zeros ("100.00" -> "100"), which silently breaks the Money contract
 * (`@nova/types`: amount is always a 2-decimal-place string). This interceptor walks
 * every response body and reformats any Decimal instance with `.toFixed(2)` before it
 * reaches JSON.stringify — the one place this is fixed, rather than every call site
 * remembering to call .toFixed(2) itself.
 */
@Injectable()
export class MoneySerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((body: unknown) => formatDecimals(body)));
  }
}

function formatDecimals(value: unknown): unknown {
  if (value instanceof Prisma.Decimal) {
    return value.toFixed(2);
  }
  if (Array.isArray(value)) {
    return value.map(formatDecimals);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, v]) => [key, formatDecimals(v)]),
    );
  }
  return value;
}
