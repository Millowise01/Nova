import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { AuditModule } from "./common/audit/audit.module";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { PolicyModule } from "./common/policy/policy.module";
import { RedisModule } from "./common/redis/redis.module";
import { ConfigModule } from "./config/config.module";
import { CartCheckoutModule } from "./modules/cart-checkout";
import { CatalogModule } from "./modules/catalog";
import { IdentityModule } from "./modules/identity";
import { OrdersModule } from "./modules/orders";
import { PrismaModule } from "./prisma/prisma.module";

// All four Phase 1 bounded contexts (backend/docs/00-bounded-contexts.md), plus the
// cross-cutting security infrastructure from backend/docs/08-security-implementation-
// checklist.md (policy engine, audit logging, Redis-backed rate limiting) every module
// consumes. Payments & Wallet, Logistics, Finance, Trust & Safety, and everything in
// Phase 3 are explicitly out of scope for this pass and are not wired here.
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    PolicyModule,
    AuditModule,
    IdentityModule,
    CatalogModule,
    CartCheckoutModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
