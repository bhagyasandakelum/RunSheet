"use client";

import React from "react";
import { EventStatus } from "@/types/common/enums";
import { Badge } from "@/components/ui/badge";

export interface EventLivePreviewProps {
  eventName?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus | string;
  description?: string;
  progress?: number;
}

export const EventLivePreview: React.FC<EventLivePreviewProps> = ({
  eventName = "Your Event Title",
  venue = "Venue / Location",
  startDate,
  endDate,
  status = EventStatus.Planning,
  description,
  progress = 0,
}) => {
  // Format date for badge
  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d;
    } catch {
      return null;
    }
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const monthShort = start
    ? start.toLocaleString("default", { month: "short" }).toUpperCase()
    : "DATE";
  const dayNumber = start ? start.getDate() : "--";

  const formatTimeRange = () => {
    if (start && end) {
      const startTime = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endTime = end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${startTime} - ${endTime}`;
    }
    return "Time to be set";
  };

  const getStatusVariant = (st?: string) => {
    switch (st) {
      case EventStatus.Active:
        return "success";
      case EventStatus.Planning:
        return "info";
      case EventStatus.Draft:
        return "neutral";
      case EventStatus.Completed:
        return "primary";
      case EventStatus.Cancelled:
        return "error";
      case EventStatus.Archived:
        return "neutral";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Live Preview
        </h4>
      </div>

      {/* Card Body */}
      <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-all duration-200">
        {/* Visual Cover Banner */}
        <div className="relative h-28 w-full bg-slate-900 dark:bg-slate-950 p-4 flex flex-col justify-between overflow-hidden border-b border-slate-200/60 dark:border-slate-800">
          {/* Top Bar inside Banner */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700">
              RunSheet
            </span>
            <Badge
              variant={getStatusVariant(status) as any}
              size="sm"
              className="capitalize"
            >
              {status}
            </Badge>
          </div>

          {/* Date Badge floating in banner */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-center min-w-[42px] border border-slate-700">
              <span className="text-[9px] font-bold text-[#44D944] tracking-wider block leading-tight">
                {monthShort}
              </span>
              <span className="text-sm font-black text-white block leading-tight">
                {dayNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Card Content Area */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {eventName || "Untitled Event"}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>

          {/* Location & Time details */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{venue || "Venue not specified"}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="truncate">{formatTimeRange()}</span>
            </div>
          </div>

          {/* Progress bar simulation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Event Readiness</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2">
        <svg
          className="w-4 h-4 text-sky-500 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          This preview shows how your event will appear to team members on the Dashboard and Event listings.
        </span>
      </div>
    </div>
  );
};
