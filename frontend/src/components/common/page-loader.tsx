"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageLoaderProps {
  fullScreen?: boolean;
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  fullScreen = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in duration-300",
        fullScreen
          ? "fixed inset-0 z-50 bg-[#EEF6EB]/80 dark:bg-[#0B0F19]/85 backdrop-blur-md"
          : "min-h-[45vh] w-full",
        className
      )}
    >
      {/* Visual Animation Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer ambient glow pulse */}
        <div className="absolute w-28 h-28 rounded-full bg-[#44D944]/30 dark:bg-[#44D944]/25 blur-2xl animate-pulse" />

        {/* Orbiting Ring 1 (Smooth spin) */}
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#44D944]/50 dark:border-[#44D944]/60 animate-[spin_6s_linear_infinite]" />

        {/* Orbiting Ring 2 (Counter-spin accent) */}
        <div className="absolute w-14 h-14 rounded-full border-2 border-t-[#44D944] border-r-transparent border-b-[#44D944]/30 border-l-transparent animate-[spin_2.5s_linear_infinite_reverse]" />

        {/* Center Glowing RunSheet Logo Badge */}
        <div className="absolute w-10 h-10 rounded-xl bg-gradient-to-tr from-[#38C238] to-[#44D944] shadow-lg shadow-[#44D944]/35 flex items-center justify-center transform hover:scale-105 transition-transform">
          <svg
            className="w-5 h-5 text-slate-950 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
