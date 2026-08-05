import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity";

import { CatalogService } from "./domain/catalog.service";
import { CatalogController } from "./http/catalog.controller";
import { CatalogPublicService } from "./public/catalog.public-service";

@Module({
  imports: [IdentityModule], // needed by JwtAuthGuard on the create-product route
  controllers: [CatalogController],
  providers: [CatalogService, CatalogPublicService],
  exports: [CatalogPublicService],
})
export class CatalogModule {}
