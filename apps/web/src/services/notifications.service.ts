import type { ListNotificationsParams } from "@nova/api-client";

import { getApiClient } from "./api";

export function listNotifications(params: ListNotificationsParams = {}) {
  return getApiClient().notifications.listNotifications(params);
}

export function markNotificationRead(notificationId: string) {
  return getApiClient().notifications.markRead(notificationId);
}

export function markAllNotificationsRead() {
  return getApiClient().notifications.markAllRead();
}
