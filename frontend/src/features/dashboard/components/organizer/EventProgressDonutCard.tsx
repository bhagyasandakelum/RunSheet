"use client";

import React from "react";

export interface EventProgressDonutCardProps {
  progressPercentage?: number;
  completed?: number;
  inProgress?: number;
  pending?: number;
  overdue?: number;
  statusLabel?: string;
}

export const EventProgressDonutCard: React.FC<EventProgressDonutCardProps> = ({
  progressPercentage = 0,
  completed = 0,
  inProgress = 0,
  pending = 0,
  overdue = 0,
  statusLabel = "Not Started",
}) => {
  // SVG Donut calculation
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progressPercentage)) / 100) * circumference;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between select-none">
      {/* Header */}
      <h2 className="text-base font-bold text-slate-900 dark:text-white">
        Event Progress
      </h2>

      {/* Donut Chart Container */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
            {/* Background Track Circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-sky-100 dark:text-sky-950/80"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-[#15803D] transition-all duration-1000 ease-out"
              fill="transparent"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        {/* Dynamic Status Text below Donut */}
        <p className="text-base font-bold text-[#15803D] dark:text-emerald-400 mt-2">
          {statusLabel}
        </p>
      </div>

      {/* 2x2 Sub-metrics Grid */}
      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-semibold">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Completed</span>
          <span className="text-slate-900 dark:text-white font-bold">{completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">In Progress</span>
          <span className="text-slate-900 dark:text-white font-bold">{inProgress}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Pending</span>
          <span className="text-slate-900 dark:text-white font-bold">{pending}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Overdue</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">{overdue}</span>
        </div>
      </div>
    </div>
  );
};
