import { Injectable } from "@nestjs/common";

import { NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

export interface VariantSnapshot {
  variantId: string;
  productId: string;
  sellerId: string;
  unitPriceAmount: string;
  unitPriceCurrency: string;
  available: boolean;
}

/** The ONLY way Cart & Checkout / Orders may read Catalog data — the synchronous-call
 *  pattern from backend/docs/00 ("Checkout calls Catalog to confirm current price and
 *  stock before creating an order"). No cross-module Prisma query anywhere else. */
@Injectable()
export class CatalogPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async confirmPriceAndStock(variantId: string, quantity: number): Promise<VariantSnapshot> {
    const variant = await this.prisma.variant.findFirst({
      where: { id: variantId, deletedAt: null },
      include: { product: true },
    });

    if (!variant || variant.product.deletedAt) {
      throw new NotFoundError("VARIANT_NOT_FOUND", "This product variant no longer exists.");
    }

    return {
      variantId: variant.id,
      productId: variant.productId,
      sellerId: variant.product.sellerId,
      unitPriceAmount: variant.priceAmount.toFixed(2),
      unitPriceCurrency: variant.priceCurrency,
      available: variant.stockQuantity >= quantity,
    };
  }
}
