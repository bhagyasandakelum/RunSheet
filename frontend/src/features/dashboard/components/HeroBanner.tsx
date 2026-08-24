"use client";

import React from "react";

export interface HeroBannerProps {
  userName?: string;
  teamName?: string;
  eventName?: string;
  customDate?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  userName = "Member",
  teamName = "Your Team",
  eventName = "Your Event",
  customDate,
}) => {
  // Format today's date or use custom date matching the screenshot
  const dateString =
    customDate ||
    `TODAY — ${new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).toUpperCase()}`;

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-teal-50/50 to-emerald-50/30 dark:from-slate-800/80 dark:via-cyan-950/20 dark:to-emerald-950/20 p-6 md:p-8 transition-all duration-300">
      {/* Background ambient glow */}
      <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-100/40 via-teal-100/20 to-transparent dark:from-emerald-900/10 pointer-events-none" />

      <div className="relative z-10 space-y-2">
        {/* Date Stamp */}
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          {dateString}
        </div>

        {/* Big Greeting */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {getGreeting()},{" "}
          <span className="text-[#10b981] dark:text-[#28c740]">{userName}</span>
        </h1>

        {/* Assignment Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal leading-relaxed pt-1">
          You&apos;re assigned to the{" "}
          <strong className="font-bold text-slate-800 dark:text-slate-200">
            {teamName}
          </strong>{" "}
          for{" "}
          <strong className="font-bold text-slate-800 dark:text-slate-200">
            {eventName}
          </strong>
          . Let&apos;s make it a success.
        </p>
      </div>
    </div>
  );
};
