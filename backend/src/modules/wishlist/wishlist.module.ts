import { Module } from "@nestjs/common";

import { CatalogModule } from "../catalog";
import { IdentityModule } from "../identity";

import { WishlistService } from "./domain/wishlist.service";
import { WishlistController } from "./http/wishlist.controller";

@Module({
  imports: [IdentityModule, CatalogModule], // JwtAuthGuard, and CatalogPublicService for item enrichment
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
