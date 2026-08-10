import type { ListNotificationsParams } from "@nova/api-client";

export const notificationsKeys = {
  all: ["notifications"] as const,
  list: (params: ListNotificationsParams = {}) =>
    [...notificationsKeys.all, "list", params] as const,
};
