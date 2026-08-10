import {
  notificationListResponseSchema,
  notificationSchema,
  type NotificationListResponse,
  type NotificationResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

export interface ListNotificationsParams {
  cursor?: string;
  limit?: number;
  unreadOnly?: boolean;
}

function toQueryParams(params: ListNotificationsParams) {
  return {
    ...params,
    unreadOnly: params.unreadOnly === undefined ? undefined : String(params.unreadOnly),
  };
}

export function createNotificationsEndpoints(client: NovaHttpClient) {
  return {
    async listNotifications(
      params: ListNotificationsParams = {},
    ): Promise<NotificationListResponse> {
      const response = await client.get<unknown>("/notifications", {
        params: toQueryParams(params),
      });
      return notificationListResponseSchema.parse(response.data);
    },

    async markRead(notificationId: string): Promise<NotificationResponse> {
      const response = await client.patch<ApiEnvelope>(`/notifications/${notificationId}/read`);
      return notificationSchema.parse(response.data.data);
    },

    async markAllRead(): Promise<void> {
      await client.patch("/notifications/read-all");
    },
  };
}
