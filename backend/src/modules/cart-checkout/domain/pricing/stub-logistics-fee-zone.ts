import { Injectable, Logger } from "@nestjs/common";

import type {
  LogisticsFeeZoneLookup,
  ShippingFeeInput,
  ShippingFeeResult,
} from "./logistics-fee-zone.interface";

// Flat, deliveryMethod-only rates — NOT a real per-district zone lookup. Logistics'
// `DeliveryZone` entity (backend/docs/00) doesn't exist yet, so there is no real zone data
// to key off; `district` is accepted (and logged) purely so the real lookup's signature is
// already correct, not used in the fee calculation itself. Amounts are illustrative
// placeholders, not sourced from Volume 5 pricing — the same "clearly fake, not silently
// wrong" posture as StubPaymentProvider.
const FLAT_RATES: Record<string, string> = {
  pickup: "0.00",
  standard: "15.00",
  express: "35.00",
};

@Injectable()
export class StubLogisticsFeeZoneLookup implements LogisticsFeeZoneLookup {
  private readonly logger = new Logger(StubLogisticsFeeZoneLookup.name);

  // TODO: wire real Logistics DeliveryZone rates here once that context is built
  // (backend/docs/00-bounded-contexts.md, Phase 2 remaining). This stub ignores district
  // entirely and returns a flat rate per delivery method.
  getShippingFee(input: ShippingFeeInput): Promise<ShippingFeeResult> {
    const amount = FLAT_RATES[input.deliveryMethod] ?? FLAT_RATES.standard;
    this.logger.debug(
      `[LOGISTICS STUB] flat ${input.deliveryMethod} rate for district "${input.district}": ${amount} ${input.currency}`,
    );
    return Promise.resolve({ amount });
  }
}
