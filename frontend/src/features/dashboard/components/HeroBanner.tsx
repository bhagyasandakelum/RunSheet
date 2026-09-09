"use client";

import React from "react";

export interface HeroBannerProps {
  userName?: string;
  teamName?: string;
  eventName?: string;
  customDate?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  teamName = "Your Team",
  eventName = "Your Event",
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Assigned to</span>
          <span className="font-semibold text-slate-900 dark:text-white">{teamName}</span>
          <span>·</span>
          <span className="font-semibold text-slate-900 dark:text-white">{eventName}</span>
        </div>
      </div>
    </div>
  );
};
