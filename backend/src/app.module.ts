import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { AuditModule } from "./common/audit/audit.module";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { OutboxModule } from "./common/outbox/outbox.module";
import { PolicyModule } from "./common/policy/policy.module";
import { RedisModule } from "./common/redis/redis.module";
import { ConfigModule } from "./config/config.module";
import { CartCheckoutModule } from "./modules/cart-checkout";
import { CatalogModule } from "./modules/catalog";
import { FinanceModule } from "./modules/finance";
import { IdentityModule } from "./modules/identity";
import { LogisticsModule } from "./modules/logistics";
import { NotificationsModule } from "./modules/notifications";
import { OrdersModule } from "./modules/orders";
import { PaymentsWalletModule } from "./modules/payments-wallet";
import { TrustSafetyModule } from "./modules/trust-safety";
import { WishlistModule } from "./modules/wishlist";
import { PrismaModule } from "./prisma/prisma.module";

// Phase 1's four bounded contexts plus Payments & Wallet and Logistics (Phase 2 —
// backend/docs/09-payments-wallet-design.md, backend/docs/10-logistics-finance-
// trust-safety-design.md), plus the cross-cutting security infrastructure from
// backend/docs/08 every module consumes. Wishlist is a small bounded context of its
// own, added alongside the others (backend/docs/00's ownership rule — it owns its
// own Wishlist/WishlistItem schema rather than being folded into Catalog or Identity).
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
    LogisticsModule,
    FinanceModule,
    TrustSafetyModule,
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
