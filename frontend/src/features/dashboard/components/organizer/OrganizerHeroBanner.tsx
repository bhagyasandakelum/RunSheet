"use client";

import React from "react";

export interface OrganizerHeroBannerProps {
  userName?: string;
  eventName?: string;
  venue?: string;
  daysRemaining?: number;
  status?: string;
}

export const OrganizerHeroBanner: React.FC<OrganizerHeroBannerProps> = ({
  eventName = "Event Overview",
  venue = "Venue not specified",
  daysRemaining = 0,
  status = "Active Event",
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{eventName}</span>
          <span>·</span>
          <span>{venue}</span>
          <span>·</span>
          <span>
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Today"}
          </span>
        </div>
      </div>

      <div className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{status}</span>
      </div>
    </div>
  );
};
