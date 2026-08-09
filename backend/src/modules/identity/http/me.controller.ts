import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { updateMeSchema, type UpdateMeInput } from "@nova/validation";

import { JwtAuthGuard, type AuthenticatedRequest } from "../../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { ProfileService } from "../domain/profile.service";

/** Inherently self-scoped (always operates on the caller's own row via req.user.sub) —
 *  same reasoning as OrdersController.listOrders: no RequirePermission/PolicyGuard
 *  needed, since there's no "whose profile" ambiguity a policy check could resolve. */
@ApiTags("identity")
@Controller("me")
export class MeController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const me = await this.profile.getMe(req.user.sub);
    return { data: me };
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateMeSchema)) body: UpdateMeInput,
  ) {
    const me = await this.profile.updateMe(req.user.sub, body);
    return { data: me };
  }
}
