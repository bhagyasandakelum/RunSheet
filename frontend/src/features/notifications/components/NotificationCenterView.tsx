"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEvent } from "@/providers/event-provider";
import { useAuth } from "@/hooks/use-auth";
import { notificationService, NotificationStatistics } from "@/services/notification-service";
import { Notification } from "@/types/common/entities";
import { NotificationType } from "@/types/common/enums";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "./NotificationCard";
import { SendAnnouncementModal } from "./SendAnnouncementModal";

export const NotificationCenterView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { selectedEvent } = useEvent();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStatistics | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filterParams: any = {};
      if (activeFilter === "unread") {
        filterParams.unreadOnly = true;
      } else if (activeFilter === "tasks") {
        // Will filter on client or single type
      }

      const [data, statsData] = await Promise.allSettled([
        notificationService.getMyNotifications(filterParams),
        notificationService.getNotificationStatistics(),
      ]);

      if (data.status === "fulfilled") {
        setNotifications(data.value || []);
      }
      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      if (stats && stats.unread > 0) {
        setStats({ ...stats, unread: stats.unread - 1, read: stats.read + 1 });
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsProcessingAll(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (stats) {
        setStats({ ...stats, unread: 0, read: stats.totalNotifications });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to mark all as read.");
    } finally {
      setIsProcessingAll(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
      if (stats) {
        setStats({ ...stats, totalNotifications: Math.max(0, stats.totalNotifications - 1) });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete notification.");
    }
  };

  const handleDeleteExpired = async () => {
    try {
      await notificationService.deleteExpiredNotifications();
      await loadNotifications();
    } catch (err: any) {
      console.error("Failed to delete expired notifications:", err);
    }
  };

  // Client-side filter
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "tasks") {
      return (
        n.notificationType === NotificationType.TaskAssigned ||
        n.notificationType === NotificationType.TaskUpdated ||
        n.notificationType === NotificationType.TaskCompleted ||
        n.notificationType === NotificationType.TaskOverdue ||
        n.notificationType === NotificationType.DeadlineReminder
      );
    }
    if (activeFilter === "teams") {
      return n.notificationType === NotificationType.TeamInvitation;
    }
    if (activeFilter === "events") {
      return (
        n.notificationType === NotificationType.EventInvitation ||
        n.notificationType === NotificationType.GeneralAnnouncement
      );
    }
    return true;
  });

  const unreadCount = stats?.unread ?? notifications.filter((n) => !n.isRead).length;

  // Group notifications by date (Today, Yesterday, Earlier This Week, Older)
  const groupNotifications = (items: Notification[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: { [key: string]: Notification[] } = {
      TODAY: [],
      YESTERDAY: [],
      "EARLIER THIS WEEK": [],
      OLDER: [],
    };

    items.forEach((item) => {
      const d = new Date(item.createdAt);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) {
        groups.TODAY.push(item);
      } else if (d.getTime() === yesterday.getTime()) {
        groups.YESTERDAY.push(item);
      } else if (d > weekAgo) {
        groups["EARLIER THIS WEEK"].push(item);
      } else {
        groups.OLDER.push(item);
      }
    });

    return groups;
  };

  const grouped = groupNotifications(filteredNotifications);

  const isOrganizer = currentUser?.userId === selectedEvent?.organizerId;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with your events, teams, and tasks.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Unread Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{unreadCount} UNREAD</span>
          </div>

          {/* Mark All As Read */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              isLoading={isProcessingAll}
              className="text-xs font-semibold"
            >
              Mark all as read
            </Button>
          )}

          {/* Broadcast Announcement (Organizer Only) */}
          {isOrganizer && selectedEvent && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAnnouncementOpen(true)}
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
              leftIcon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              }
            >
              Broadcast
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-700 dark:text-red-300 font-semibold">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Activity", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "tasks", label: "Tasks" },
          { id: "teams", label: "Teams" },
          { id: "events", label: "Events & Announcements" },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grouped Notifications List */}
      {isLoading ? (
        <div className="py-24 text-center text-xs font-semibold text-slate-400">
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl">
            🔔
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            All caught up!
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have no notifications matching this view. When tasks, milestones, or team updates occur, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([groupTitle, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={groupTitle} className="space-y-3">
                {/* Group Divider */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {groupTitle}
                  </span>
                  <div className="h-px bg-slate-200/80 dark:border-slate-800/80 w-full" />
                </div>

                {/* Notifications in this Group */}
                <div className="space-y-3">
                  {items.map((notification) => (
                    <NotificationCard
                      key={notification.notificationId}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {selectedEvent && (
        <SendAnnouncementModal
          isOpen={isAnnouncementOpen}
          eventId={selectedEvent.eventId}
          eventName={selectedEvent.eventName}
          onClose={() => setIsAnnouncementOpen(false)}
          onSuccess={loadNotifications}
        />
      )}
    </div>
  );
};
