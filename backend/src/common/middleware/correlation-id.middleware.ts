import { randomUUID } from "node:crypto";

import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { correlationIdStorage } from "../logging/correlation-context";

export interface RequestWithCorrelationId extends Request {
  correlationId: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithCorrelationId, res: Response, next: NextFunction) {
    req.correlationId = `req_${randomUUID()}`;
    res.setHeader("x-correlation-id", req.correlationId);
    // O-1 — everything downstream of this call (routing, controller, service,
    // any awaited call several layers deep) runs inside this ALS context, so
    // logging.module.ts's `mixin` can read the ID back without it being
    // threaded through every function signature.
    correlationIdStorage.run(req.correlationId, next);
  }
}
