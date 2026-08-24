import { Injectable, Logger } from "@nestjs/common";

import type {
  CouponValidationInput,
  CouponValidationResult,
  MarketingCouponValidator,
} from "./marketing-coupon-validator.interface";

// A single hardcoded dev code — NOT a real campaign lookup. Marketing's campaign/coupon
// schema doesn't exist yet (backend/docs/00: "do not invent one here"), so there is nothing
// real to validate against; this exists only to exercise the discount arithmetic end to end
// (percentage off subtotal, capped so a discount can never exceed the subtotal it applies
// to), the same "clearly fake, not silently wrong" posture as StubPaymentProvider and the
// Logistics fee-zone stub. Every other code is rejected as invalid.
const DEV_STUB_CODE = "WELCOME10";
const DEV_STUB_PERCENT_OFF = 0.1;

@Injectable()
export class StubMarketingCouponValidator implements MarketingCouponValidator {
  private readonly logger = new Logger(StubMarketingCouponValidator.name);

  // TODO: wire a real call to Marketing's campaign-validation API here once that context
  // is built (backend/docs/00-bounded-contexts.md, Phase 3+).
  validate(input: CouponValidationInput): Promise<CouponValidationResult> {
    if (input.code.trim().toUpperCase() !== DEV_STUB_CODE) {
      this.logger.debug(`[MARKETING STUB] code "${input.code}" not recognized — rejecting`);
      return Promise.resolve({ valid: false, discountAmount: "0.00" });
    }

    const discount = Number(input.subtotal) * DEV_STUB_PERCENT_OFF;
    this.logger.debug(
      `[MARKETING STUB] code "${input.code}" applied: ${discount.toFixed(2)} ${input.currency} off`,
    );
    return Promise.resolve({ valid: true, discountAmount: discount.toFixed(2) });
  }
}
