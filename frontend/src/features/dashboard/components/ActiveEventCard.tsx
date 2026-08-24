"use client";

import React from "react";
import Link from "next/link";
import { ActiveEventWidget } from "@/services/dashboard-service";

export interface ActiveEventCardProps {
  event?: ActiveEventWidget | null;
}

export const ActiveEventCard: React.FC<ActiveEventCardProps> = ({ event }) => {
  if (!event || !event.eventName) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs flex flex-col justify-center items-center text-center min-h-[160px]">
        <p className="text-xs text-slate-400 font-medium">No active event details available.</p>
      </div>
    );
  }

  const activeEvent = event;

  // Format date range
  const formatEventDates = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return "Dates to be announced";
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const startMonth = start.toLocaleDateString("en-US", { month: "short" });
      const startDay = start.getDate();
      const endMonth = end.toLocaleDateString("en-US", { month: "short" });
      const endDay = end.getDate();

      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}`;
      }
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    } catch {
      return "Dates to be announced";
    }
  };

  const datesFormatted = formatEventDates(activeEvent.startDate, activeEvent.endDate);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs flex flex-col justify-between min-h-[160px]">
      <div>
        {/* Title */}
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{activeEvent.eventName}</span>
        </div>

        {/* Location and Date details */}
        <div className="space-y-1.5 mt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{activeEvent.venue}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{datesFormatted}</span>
          </div>
        </div>
      </div>

      {/* Footer: Live Now Badge & Navigation Arrow */}
      <div className="flex items-center justify-between mt-4">
        {activeEvent.isLive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Now
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 uppercase">
            {activeEvent.status}
          </span>
        )}

        <Link
          href={`/events/${activeEvent.eventId || ""}`}
          className="p-1.5 rounded-full text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          title="View Event Details"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
