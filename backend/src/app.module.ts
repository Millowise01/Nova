import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { AuditModule } from "./common/audit/audit.module";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { OutboxModule } from "./common/outbox/outbox.module";
import { PolicyModule } from "./common/policy/policy.module";
import { RedisModule } from "./common/redis/redis.module";
import { ConfigModule } from "./config/config.module";
import { CartCheckoutModule } from "./modules/cart-checkout";
import { CatalogModule } from "./modules/catalog";
import { IdentityModule } from "./modules/identity";
import { NotificationsModule } from "./modules/notifications";
import { OrdersModule } from "./modules/orders";
import { PaymentsWalletModule } from "./modules/payments-wallet";
import { WishlistModule } from "./modules/wishlist";
import { PrismaModule } from "./prisma/prisma.module";

// Phase 1's four bounded contexts plus Payments & Wallet (Phase 2, in progress —
// backend/docs/09-payments-wallet-design.md), plus the cross-cutting security
// infrastructure from backend/docs/08 every module consumes. Logistics, Finance,
// Trust & Safety, and everything in Phase 3 are explicitly out of scope and not
// wired here. Wishlist is a small bounded context of its own, added alongside the
// others (backend/docs/00's ownership rule — it owns its own Wishlist/WishlistItem
// schema rather than being folded into Catalog or Identity).
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    PolicyModule,
    AuditModule,
    OutboxModule,
    IdentityModule,
    CatalogModule,
    CartCheckoutModule,
    PaymentsWalletModule,
    OrdersModule,
    WishlistModule,
    NotificationsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
