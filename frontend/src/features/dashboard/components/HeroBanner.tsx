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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 md:p-8 shadow-xs select-none">
      <div className="relative z-10 space-y-2">
        {/* Date Stamp */}
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          {dateString}
        </div>

        {/* Big Greeting */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {getGreeting()},{" "}
          <span className="text-[#44D944]">{userName}</span>
        </h1>

        {/* Assignment Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal leading-relaxed pt-0.5">
          You&apos;re assigned to the{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-200">
            {teamName}
          </strong>{" "}
          for{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-200">
            {eventName}
          </strong>
          . Let&apos;s make it a success.
        </p>
      </div>
    </div>
  );
};
