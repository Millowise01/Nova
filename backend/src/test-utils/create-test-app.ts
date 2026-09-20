import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

import { ApiExceptionFilter } from "../common/filters/api-exception.filter";
import { MoneySerializationInterceptor } from "../common/interceptors/money-serialization.interceptor";
import { RedisService } from "../common/redis/redis.service";
import { AppConfigService } from "../config/config.service";

/** Mirrors main.ts's bootstrap wiring exactly, so integration tests exercise the same
 *  global filters/interceptors/prefix/CORS production actually runs — not a
 *  stripped-down test-only configuration that could hide a bug main.ts's setup would catch.
 *
 *  Flushes Redis on every call: every spec file boots its own NestJS app instance but
 *  they all talk to the SAME real Redis container, so rate-limit counters (keyed by IP —
 *  every test request comes from 127.0.0.1) would otherwise accumulate ACROSS files in
 *  one test run and spuriously trip limits meant to catch real abuse, not legitimate
 *  test volume. This keeps the rate limiter itself fully real (see rate-limit.integration.spec.ts
 *  for a test that deliberately trips it) without every other suite needing to know
 *  that detail. */
export async function createTestApp(moduleRef: TestingModule): Promise<INestApplication> {
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix("v1", { exclude: ["metrics"] });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new MoneySerializationInterceptor());

  const config = app.get(AppConfigService);
  app.enableCors({
    origin: config
      .get("CORS_ALLOWED_ORIGINS")
      .split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  });

  await app.init();
  await app.get(RedisService).client.flushdb();
  return app;
}
