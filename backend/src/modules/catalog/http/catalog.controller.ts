import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  createBrandSchema,
  createCategorySchema,
  createProductSchema,
  type CreateBrandInput,
  type CreateCategoryInput,
  type CreateProductInput,
} from "@nova/validation";

import { JwtAuthGuard, type AuthenticatedRequest } from "../../../common/guards/jwt-auth.guard";
import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { PolicyGuard } from "../../../common/policy/policy.guard";
import { RequirePermission } from "../../../common/policy/require-permission.decorator";
import { CatalogService } from "../domain/catalog.service";

@ApiTags("catalog")
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  // Category/Brand taxonomy management is admin-only — previously had NO guard at all
  // (any request, even unauthenticated, could create one). Fixed as part of the
  // security implementation pass (backend/docs/08).
  @Post("categories")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "Category")
  async createCategory(
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput,
  ) {
    const category = await this.catalog.createCategory(body);
    return { data: category };
  }

  @Post("brands")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "Brand")
  async createBrand(@Body(new ZodValidationPipe(createBrandSchema)) body: CreateBrandInput) {
    const brand = await this.catalog.createBrand(body);
    return { data: brand };
  }

  @Post("products")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "Product")
  async createProduct(
    @Req() req: AuthenticatedRequest & RequestWithCorrelationId,
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductInput,
  ) {
    const product = await this.catalog.createProduct(req.user.sub, body, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: product };
  }

  @Get("products")
  async listProducts(@Query("cursor") cursor?: string) {
    return this.catalog.listProducts(cursor);
  }

  @Get("products/:slug")
  async getProduct(@Param("slug") slug: string) {
    const product = await this.catalog.getProductBySlug(slug);
    return { data: product };
  }
}
