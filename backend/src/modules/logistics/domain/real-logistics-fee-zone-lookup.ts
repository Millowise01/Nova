import { Injectable } from "@nestjs/common";

import type {
  LogisticsFeeZoneLookup,
  ShippingFeeInput,
  ShippingFeeResult,
} from "../../cart-checkout/domain/pricing/logistics-fee-zone.interface";

import { DeliveryZoneService } from "./delivery-zone.service";

/** The real implementation Cart & Checkout's LogisticsFeeZoneLookup seam was built to
 *  accept (backend/src/modules/cart-checkout/domain/pricing/logistics-fee-zone.interface.ts's
 *  own comment: "swapping the stub for a real zone-rate lookup later is a one-line
 *  change in cart-checkout.module.ts"). Delegates to DeliveryZoneService — the same
 *  method backs both this and the admin-facing zone endpoints, one implementation. */
@Injectable()
export class RealLogisticsFeeZoneLookup implements LogisticsFeeZoneLookup {
  constructor(private readonly zones: DeliveryZoneService) {}

  getShippingFee(input: ShippingFeeInput): Promise<ShippingFeeResult> {
    return this.zones.getShippingFee(input);
  }
}
