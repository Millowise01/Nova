import { subject } from "@casl/ability";
import { Injectable, Logger } from "@nestjs/common";

import type { ListNotificationsQuery } from "@nova/validation";

import { ForbiddenError, NotFoundError } from "../../../common/errors/api-error";
import { decodeCursor, encodeCursor } from "../../../common/pagination/cursor";
import { AbilityFactory } from "../../../common/policy/ability.factory";
import type { PolicyUser } from "../../../common/policy/policy.types";
import { PrismaService } from "../../../prisma/prisma.service";

const DEFAULT_PAGE_SIZE = 20;

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  referenceType?: string;
  referenceId?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  /** Called only by this module's own outbox event handlers (events/handlers/) — never
   *  directly by a controller. Push/email/SMS delivery is stubbed exactly like
   *  OtpService.requestOtp: logged in development, nothing actually sent. */
  async createFromEvent(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
    });

    // TODO: wire real push/email/SMS provider (Volume 5) at this integration point.
    // In development (and in this pass — there is no Volume 5 integration yet), the
    // notification is only ever stored and logged, never actually delivered.
    this.logger.debug(
      `[NOTIFICATION STUB] ${input.type} for user ${input.userId}: "${input.title}"`,
    );

    return notification;
  }

  /** GET /v1/notifications — inherently self-scoped ("my notifications"), no ability
   *  check needed, same reasoning as WishlistService.getWishlist. */
  async listNotifications(userId: string, query: ListNotificationsQuery = {}) {
    const { cursor, limit = DEFAULT_PAGE_SIZE, unreadOnly } = query;
    const decoded = cursor ? decodeCursor(cursor) : null;

    const [rows, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(unreadOnly ? { readAt: null } : {}),
          ...(decoded ? { createdAt: { lt: new Date(decoded.sortValue) } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      }),
      this.prisma.notification.count({ where: { userId, deletedAt: null, readAt: null } }),
    ]);

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];

    return {
      data: page,
      pageInfo: {
        hasMore,
        nextCursor:
          hasMore && last
            ? encodeCursor({ sortValue: last.createdAt.toISOString(), id: last.id })
            : null,
      },
      unreadCount,
    };
  }

  /**
   * PATCH /v1/notifications/:id/read — takes an arbitrary notification ID, so (like
   * WishlistService.removeItem) this needs a real ABAC check via subject(), never an
   * inline `if (notification.userId !== userId)`.
   */
  async markRead(notificationId: string, requester: PolicyUser) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, deletedAt: null },
    });
    if (!notification) {
      throw new NotFoundError("NOTIFICATION_NOT_FOUND", "No notification found for this ID.");
    }

    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("update", subject("Notification", notification))) {
      throw new ForbiddenError(
        "NOTIFICATION_ACCESS_DENIED",
        "You do not have access to this notification.",
      );
    }

    if (notification.readAt) return notification;

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  /** PATCH /v1/notifications/read-all — inherently self-scoped, no ability check
   *  needed (same reasoning as listNotifications above). */
  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, deletedAt: null, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
