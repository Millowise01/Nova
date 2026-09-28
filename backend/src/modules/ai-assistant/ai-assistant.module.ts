import { Module } from "@nestjs/common";

import { CatalogModule } from "../catalog";
import { IdentityModule } from "../identity";

import { AiAssistantService } from "./domain/ai-assistant.service";
import { AI_PROVIDER_ADAPTER } from "./domain/providers/ai-provider.token";
import { ClaudeProvider } from "./domain/providers/claude-provider";
import { AiAssistantController } from "./http/ai-assistant.controller";

@Module({
  // IdentityModule: JwtAuthGuard. CatalogModule: CatalogPublicService.searchPublished,
  // the only real data this assistant is allowed to state facts from.
  imports: [IdentityModule, CatalogModule],
  controllers: [AiAssistantController],
  providers: [
    AiAssistantService,
    // ADR-0005: Claude, chosen by the repository owner. Swapping providers later
    // (Volume 4, Part E3) is a one-line change here.
    { provide: AI_PROVIDER_ADAPTER, useClass: ClaudeProvider },
  ],
})
export class AiAssistantModule {}
