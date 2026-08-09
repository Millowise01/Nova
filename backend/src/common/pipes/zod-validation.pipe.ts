import type { PipeTransform } from "@nestjs/common";
import type { z, ZodTypeAny } from "zod";

import { BadRequestError } from "../errors/api-error";

/** Wraps a @nova/validation Zod schema as a NestJS pipe. Every controller uses this —
 *  never class-validator decorators, never a hand-rolled if-check — so validation always
 *  goes through the exact schema the frontend uses too (backend/docs/05). Generic over
 *  the whole schema (not just its output type) so `transform` returns a real type, not
 *  `any` — and so schemas whose input differs from their output (e.g. listProductsQuerySchema's
 *  `.transform()` from the query string "true"/"false" to a real boolean) type-check too. */
export class ZodValidationPipe<S extends ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: S) {}

  transform(value: unknown): z.infer<S> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestError(
        "VALIDATION_FAILED",
        "The request body failed validation.",
        result.error.flatten(),
      );
    }
    return result.data as z.infer<S>;
  }
}
