import { Injectable } from "@nestjs/common";

import type { CreateDeliveryZoneInput } from "@nova/validation";

import { ConflictError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

// Same flat fallback rates the stub used (backend/src/modules/cart-checkout/domain/
// pricing/stub-logistics-fee-zone.ts) — a district with no seeded DeliveryZone degrades
// to this instead of breaking checkout. No real per-district data is invented anywhere.
const FALLBACK_RATES: Record<string, string> = {
  pickup: "0.00",
  standard: "15.00",
  express: "35.00",
};

@Injectable()
export class DeliveryZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async createZone(input: CreateDeliveryZoneInput) {
    const existing = await this.prisma.deliveryZone.findUnique({
      where: { district: input.district },
    });
    if (existing) {
      throw new ConflictError(
        "DELIVERY_ZONE_DISTRICT_TAKEN",
        "A delivery zone already exists for this district.",
      );
    }
    return this.prisma.deliveryZone.create({ data: input });
  }

  async listZones() {
    return this.prisma.deliveryZone.findMany({
      where: { deletedAt: null },
      orderBy: { district: "asc" },
    });
  }

  /** Backs both the admin-facing zone list and CheckoutService's real shipping-fee
   *  lookup (via RealLogisticsFeeZoneLookup) — one implementation, two callers. */
  async getShippingFee(input: {
    deliveryMethod: string;
    district: string;
  }): Promise<{ amount: string }> {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { district: input.district, deletedAt: null },
    });

    if (!zone) {
      return { amount: FALLBACK_RATES[input.deliveryMethod] ?? FALLBACK_RATES.standard };
    }

    const amount =
      input.deliveryMethod === "express"
        ? zone.expressFeeAmount
        : input.deliveryMethod === "pickup"
          ? "0.00"
          : zone.standardFeeAmount;
    return { amount: amount.toString() };
  }
}
