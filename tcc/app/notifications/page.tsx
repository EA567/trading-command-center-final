"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/PageLoading";
import { buildNotifications } from "@/lib/utils/notifications";
import { formatDate } from "@/lib/utils/format";

export default function NotificationsPage() {
  const { loading, goals, tasks } = useAppStore();
  const notifications = buildNotifications(goals, tasks);

  if (loading) return <PageLoading variant="list" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Notifications</h1>
        <p className="text-sm text-zinc-500 mt-1">Trade, news, goal, and challenge reminders, generated automatically</p>
      </div>

      {notifications.length === 0 ? (
        <Panel><EmptyState icon={Bell} title="You're all caught up" subtitle="Reminders for upcoming high-impact news, due tasks, and goal deadlines will show up here." /></Panel>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Panel key={n.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{n.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{n.message} · {formatDate(n.time.slice(0, 10))}</p>
              </div>
              <Badge tone={n.severity === "critical" ? "red" : n.severity === "warning" ? "amber" : "blue"}>{n.type}</Badge>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
