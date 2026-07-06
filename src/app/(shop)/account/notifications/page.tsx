"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ items: Notification[] }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await notificationsApi.list();
      return data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.items ?? [];
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-primary-700" />
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && (
            <span className="bg-primary-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1.5 text-sm text-primary-700 hover:underline"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="card p-10 text-center">
          <Bell size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`card p-4 border-l-4 ${n.is_read ? "border-gray-200" : "border-primary-700 bg-primary-50/30"}`}
          >
            <p className="text-sm font-semibold text-gray-900">{n.title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.created_at).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
