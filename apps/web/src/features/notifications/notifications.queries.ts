"use client";

import { useQuery } from "@tanstack/react-query";

import type { ListNotificationsParams } from "@nova/api-client";

import { QUERY_STALE_TIME } from "@/config/app";
import { useAuth } from "@/providers/auth-provider";
import { listNotifications } from "@/services/notifications.service";

import { notificationsKeys } from "./notifications.keys";

/** Also how the header's unread-count badge gets its number (call with { limit: 1 }
 *  — unreadCount reflects the user's TOTAL unread count regardless of page size or
 *  the unreadOnly filter, so a 1-row page is enough to read it cheaply). */
export function useNotificationsQuery(params: ListNotificationsParams = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => listNotifications(params),
    staleTime: QUERY_STALE_TIME.short,
    enabled: isAuthenticated,
  });
}
