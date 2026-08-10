"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { NotificationListResponse } from "@nova/validation";

import { useToast } from "@/providers/toast-provider";
import { markAllNotificationsRead, markNotificationRead } from "@/services/notifications.service";

import { notificationsKeys } from "./notifications.keys";

/** Same onMutate/onError/onSuccess/onSettled pattern as
 *  features/wishlist/wishlist.mutations.ts. Notifications are cached under several
 *  different queryKeys at once (the header's { limit: 1 } badge query and the
 *  notifications page's full list are separate cache entries), so the optimistic
 *  update uses setQueriesData against the whole notificationsKeys.all prefix rather
 *  than a single setQueryData call — otherwise marking read on the page wouldn't
 *  optimistically decrement the header's badge (or vice versa). */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationsKeys.all,
      });

      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationsKeys.all },
        (old) => {
          if (!old) return old;
          const target = old.data.find((n) => n.id === notificationId);
          if (!target || target.readAt) return old;
          return {
            ...old,
            data: old.data.map((n) =>
              n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n,
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _notificationId, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Couldn't mark that notification as read. Please try again.");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationsKeys.all,
      });

      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationsKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
            unreadCount: 0,
          };
        },
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Couldn't mark all notifications as read. Please try again.");
    },

    onSuccess: () => {
      toast.success("All notifications marked as read");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
