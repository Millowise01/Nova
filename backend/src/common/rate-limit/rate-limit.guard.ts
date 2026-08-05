import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { TooManyRequestsError } from "../errors/api-error";
import { RedisService } from "../redis/redis.service";

import { RATE_LIMIT_KEY, type RateLimitOptions } from "./rate-limit.decorator";

interface RequestWithUser extends Request {
  user?: { sub: string };
}

/** Redis INCR + EXPIRE sliding-window-ish counter — fine-grained, per-account (falls
 *  back to per-IP for unauthenticated endpoints like signup/login/otp, which is exactly
 *  where Vol 3, C4 names abuse protection as most needed) and per-endpoint (the counter
 *  key includes the controller+handler name, so a limit on /auth/otp never throttles
 *  /auth/login). */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!options) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const identifier = request.user?.sub ?? request.ip ?? "unknown";
    const endpointKey = `${context.getClass().name}.${context.getHandler().name}`;
    const redisKey = `ratelimit:${endpointKey}:${identifier}`;

    const count = await this.redis.client.incr(redisKey);
    if (count === 1) {
      await this.redis.client.expire(redisKey, options.windowSeconds);
    }

    if (count > options.limit) {
      throw new TooManyRequestsError(
        "RATE_LIMIT_EXCEEDED",
        `Too many requests. Limit is ${options.limit} per ${options.windowSeconds}s.`,
      );
    }

    return true;
  }
}
