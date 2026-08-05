import type { PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

import { BadRequestError } from "../errors/api-error";

/** Wraps a @nova/validation Zod schema as a NestJS pipe. Every controller uses this —
 *  never class-validator decorators, never a hand-rolled if-check — so validation always
 *  goes through the exact schema the frontend uses too (backend/docs/05). Generic over
 *  the schema's output type so `transform` returns a real type, not `any`. */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestError(
        "VALIDATION_FAILED",
        "The request body failed validation.",
        result.error.flatten(),
      );
    }
    return result.data;
  }
}
