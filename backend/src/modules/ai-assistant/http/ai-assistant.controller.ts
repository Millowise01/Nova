import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { aiAssistantMessageSchema, type AiAssistantMessageInput } from "@nova/validation";

import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { RateLimit } from "../../../common/rate-limit/rate-limit.decorator";
import { RateLimitGuard } from "../../../common/rate-limit/rate-limit.guard";
import { AiAssistantService } from "../domain/ai-assistant.service";

@ApiTags("ai-assistant")
@Controller("ai/assistant")
export class AiAssistantController {
  constructor(private readonly assistant: AiAssistantService) {}

  // Authenticated (unlike most read routes, this ties usage to an account — a real
  // decision, not an oversight, since every call may reach a paid external API) and
  // rate limited: 20/60s per caller is deliberately tighter than a plain read endpoint
  // would need, purely for cost control on a paid LLM call, not abuse alone.
  @Post("message")
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit(20, 60)
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body(new ZodValidationPipe(aiAssistantMessageSchema)) body: AiAssistantMessageInput,
  ) {
    const result = await this.assistant.chat(body.message);
    return { data: result };
  }
}
