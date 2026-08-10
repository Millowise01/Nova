"use client";

import { Badge, Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import type { NotificationResponse } from "@nova/validation";

import { useAuth } from "@/providers/auth-provider";

import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../notifications.mutations";
import { useNotificationsQuery } from "../notifications.queries";

function NotificationRow({
  notification,
  onMarkRead,
  markingRead,
}: {
  notification: NotificationResponse;
  onMarkRead: (id: string) => void;
  markingRead: boolean;
}) {
  const isUnread = !notification.readAt;

  return (
    <Card
      className={`flex items-start justify-between gap-4 ${isUnread ? "border-l-4 border-l-[color:var(--ds-primary)]" : ""}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{notification.title}</span>
          {isUnread ? (
            <Badge size="sm" tone="info">
              New
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">{notification.body}</p>
        <p className="text-xs text-[color:var(--color-foreground-muted)]">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
      {isUnread ? (
        <Button
          disabled={markingRead}
          onClick={() => onMarkRead(notification.id)}
          size="sm"
          variant="outline"
        >
          Mark read
        </Button>
      ) : null}
    </Card>
  );
}

export function NotificationsScreen() {
  const { isAuthenticated } = useAuth();
  const query = useNotificationsQuery({ limit: 20 });
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  if (!isAuthenticated) {
    return <EmptyState description="Sign in to view your notifications." title="Notifications" />;
  }

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading notifications...
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load your notifications."
        title="Something went wrong"
      />
    );
  }

  const notifications = query.data?.data ?? [];
  const unreadCount = query.data?.unreadCount ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-slate-600">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
            size="sm"
            variant="outline"
          >
            Mark all read
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          description="Order, refund, and account updates will show up here."
          title="No notifications yet"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              markingRead={markRead.isPending && markRead.variables === notification.id}
              notification={notification}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
