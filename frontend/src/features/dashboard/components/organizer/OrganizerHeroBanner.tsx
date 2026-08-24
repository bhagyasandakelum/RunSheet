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
  userName = "Organizer",
  eventName = "Event Overview",
  venue = "Venue not specified",
  daysRemaining = 0,
  status = "Active Event",
}) => {
  return (
    <div className="space-y-4 select-none">
      {/* Top Welcome Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Monitor your event, manage teams, and keep everything on schedule.
          </p>
        </div>

        <div className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{status}</span>
        </div>
      </div>

      {/* 3 Event Meta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Card 1: Event */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md">
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
              EVENT
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {eventName}
            </p>
          </div>
        </div>

        {/* Card 2: Venue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md">
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
              VENUE
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {venue}
            </p>
          </div>
        </div>

        {/* Card 3: Countdown */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
              COUNTDOWN
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {daysRemaining} Days Remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
