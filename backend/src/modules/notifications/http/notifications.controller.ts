import { Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { listNotificationsQuerySchema, type ListNotificationsQuery } from "@nova/validation";

import { JwtAuthGuard, type AuthenticatedRequest } from "../../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { NotificationService } from "../domain/notification.service";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  async listNotifications(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(listNotificationsQuerySchema)) query: ListNotificationsQuery,
  ) {
    return this.notifications.listNotifications(req.user.sub, query);
  }

  @Patch(":id/read")
  async markRead(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const notification = await this.notifications.markRead(id, {
      id: req.user.sub,
      roles: req.user.roles,
    });
    return { data: notification };
  }

  @Patch("read-all")
  async markAllRead(@Req() req: AuthenticatedRequest) {
    await this.notifications.markAllRead(req.user.sub);
  }
}
