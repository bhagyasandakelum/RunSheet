"use client";

import React from "react";
import Link from "next/link";
import { Notification } from "@/types/common/entities";
import { NotificationType } from "@/types/common/enums";

export interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAcceptInvitation?: (id: string) => void;
  onDeclineInvitation?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAcceptInvitation,
  onDeclineInvitation,
}) => {
  const {
    notificationId,
    title,
    message,
    notificationType,
    isRead,
    createdAt,
    relatedTaskId,
    relatedEventId,
    relatedTask,
    relatedEvent,
  } = notification;

  // Format relative time
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  // Visual configuration per notification type
  const getConfig = () => {
    switch (notificationType) {
      case NotificationType.TaskAssigned:
        return {
          icon: (
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          iconBg: "bg-emerald-500/10 border-emerald-500/20",
          leftBorder: "border-l-4 border-l-emerald-500",
          tagLabel: "Task",
          tagStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-500/30",
          actionText: "View Task",
          actionHref: relatedTaskId ? `/tasks/${relatedTaskId}` : "/tasks",
        };

      case NotificationType.TaskOverdue:
        return {
          icon: (
            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconBg: "bg-rose-500/10 border-rose-500/20",
          leftBorder: "border-l-4 border-l-rose-500",
          tagLabel: "Alert",
          tagStyle: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-500/30",
          actionText: "Review Task",
          actionHref: relatedTaskId ? `/tasks/${relatedTaskId}` : "/tasks",
        };

      case NotificationType.TeamInvitation:
        return {
          icon: (
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          iconBg: "bg-blue-500/10 border-blue-500/20",
          leftBorder: "border-l-4 border-l-blue-500",
          tagLabel: "Team",
          tagStyle: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-500/30",
          actionText: "View Teams",
          actionHref: "/teams",
        };

      case NotificationType.EventInvitation:
        return {
          icon: (
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          iconBg: "bg-purple-500/10 border-purple-500/20",
          leftBorder: "border-l-4 border-l-purple-500",
          tagLabel: "Event",
          tagStyle: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-500/30",
          actionText: "View Invitations",
          actionHref: "/invitations",
        };

      case NotificationType.TaskUpdated:
        return {
          icon: (
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          iconBg: "bg-amber-500/10 border-amber-500/20",
          leftBorder: "border-l-4 border-l-amber-500",
          tagLabel: "Task",
          tagStyle: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/30",
          actionText: "View Task",
          actionHref: relatedTaskId ? `/tasks/${relatedTaskId}` : "/tasks",
        };

      case NotificationType.TaskCompleted:
        return {
          icon: (
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: "bg-slate-500/10 border-slate-500/20",
          leftBorder: "border-l-4 border-l-slate-400 dark:border-l-slate-600",
          tagLabel: "Task",
          tagStyle: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
          actionText: relatedTaskId ? "View Task" : undefined,
          actionHref: relatedTaskId ? `/tasks/${relatedTaskId}` : undefined,
        };

      case NotificationType.DeadlineReminder:
        return {
          icon: (
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: "bg-amber-500/10 border-amber-500/20",
          leftBorder: "border-l-4 border-l-amber-500",
          tagLabel: "Alert",
          tagStyle: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/30",
          actionText: "View Task",
          actionHref: relatedTaskId ? `/tasks/${relatedTaskId}` : "/tasks",
        };

      case NotificationType.GeneralAnnouncement:
      default:
        return {
          icon: (
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          ),
          iconBg: "bg-indigo-500/10 border-indigo-500/20",
          leftBorder: "border-l-4 border-l-indigo-500",
          tagLabel: "Announcement",
          tagStyle: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-500/30",
          actionText: relatedEventId ? "View Event" : undefined,
          actionHref: relatedEventId ? `/events/${relatedEventId}` : undefined,
        };
    }
  };

  const config = getConfig();

  return (
    <div
      onClick={() => {
        if (!isRead && onMarkAsRead) {
          onMarkAsRead(notificationId);
        }
      }}
      className={`group relative bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700 ${
        config.leftBorder
      } ${!isRead ? "bg-emerald-50/20 dark:bg-[#152037]" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left Icon & Message Body */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${config.iconBg}`}
          >
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {title}
              </h3>
              {!isRead && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Unread" />
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {message}
            </p>

            {/* Bottom Actions & Tag */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.tagStyle}`}
              >
                {config.tagLabel}
              </span>

              {/* Action Link */}
              {config.actionHref && (
                <Link
                  href={config.actionHref}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isRead && onMarkAsRead) {
                      onMarkAsRead(notificationId);
                    }
                  }}
                >
                  <span>{config.actionText}</span>
                  <span>→</span>
                </Link>
              )}

              {/* Special Action Buttons for Invitations */}
              {notificationType === NotificationType.TeamInvitation && (
                <div className="flex items-center gap-2">
                  <Link href="/teams">
                    <button
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAcceptInvitation) onAcceptInvitation(notificationId);
                      }}
                    >
                      Accept
                    </button>
                  </Link>
                  <button
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeclineInvitation) onDeclineInvitation(notificationId);
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Timestamp & Delete button */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {formatTime(createdAt)}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isRead && onMarkAsRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notificationId);
                }}
                className="inline-flex items-center gap-1 p-1 px-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[11px] font-semibold"
                title="Mark as read"
              >
                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Read</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notificationId);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete notification"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
