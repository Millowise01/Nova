import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity";

import { DisputeService } from "./domain/dispute.service";
import { KycService } from "./domain/kyc.service";
import { SellerSuspensionService } from "./domain/seller-suspension.service";
import { TrustSafetyController } from "./http/trust-safety.controller";

@Module({
  // IdentityModule for JwtAuthGuard AND SellerSuspensionService's write path
  // (IdentityPublicService.setSellerSuspended) — no other module imports Trust & Safety,
  // so this stays a safe, non-cyclic edge (same direction as every other Phase 1/2
  // module already depending on Identity).
  imports: [IdentityModule],
  controllers: [TrustSafetyController],
  providers: [KycService, SellerSuspensionService, DisputeService],
})
export class TrustSafetyModule {}
