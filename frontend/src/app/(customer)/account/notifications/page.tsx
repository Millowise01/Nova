"use client";

import { useState } from "react";
import { Bell, Package, Shield, Tag } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/domain";

const ICONS: Record<Notification["type"], React.ElementType> = {
  order: Package,
  promotion: Tag,
  security: Shield,
  system: Bell,
};

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    title: "Order Delivered",
    body: "Your order #ord-001 has been delivered successfully.",
    isRead: false,
    createdAt: new Date(Date.now() - 1_800_000).toISOString(),
    type: "order",
  },
  {
    id: "n-2",
    title: "Flash Sale: 20% Off Eco Products",
    body: "Use code ECO20 at checkout before midnight tonight.",
    isRead: false,
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    type: "promotion",
  },
  {
    id: "n-3",
    title: "New login detected",
    body: "A login was detected from a new device. If this wasn't you, secure your account immediately.",
    isRead: true,
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    type: "security",
  },
  {
    id: "n-4",
    title: "Order Confirmed",
    body: "Your order #ord-002 has been confirmed and is being packed.",
    isRead: true,
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    type: "order",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.isRead).length;

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-slate-500">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <Bell size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition hover:shadow-sm",
                  n.isRead
                    ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    : "border-primary/20 bg-primary/5 dark:bg-primary/10",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                    n.type === "order" && "bg-primary/10 text-primary",
                    n.type === "promotion" && "bg-secondary/20 text-secondary",
                    n.type === "security" && "bg-error/10 text-error",
                    n.type === "system" && "bg-slate-100 text-slate-600 dark:bg-slate-800",
                  )}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
